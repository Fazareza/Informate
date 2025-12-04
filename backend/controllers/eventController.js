const db = require('../config/database');
const jwt = require('jsonwebtoken');

exports.getAllEvents = async (req, res) => {
    try {
        const { search, category, month, year, startDate, endDate } = req.query;
        
        // 1. CEK TOKEN MANUAL (Soft Auth)
        // Kita lakukan ini manual karena endpoint ini PUBLIC (bisa diakses tanpa login)
        // tapi jika ada token, kita butuh ID-nya untuk cek bookmark.
        let userId = null;
        const authHeader = req.header('Authorization');
        if (authHeader) {
            const token = authHeader.replace('Bearer ', '');
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.id;
            } catch (err) {
                // Token invalid/expired, abaikan saja (dianggap guest)
            }
        }

        let query = `
            SELECT 
                e.event_id, 
                e.nama_acara, 
                e.deskripsi, 
                e.tanggal_mulai, 
                e.lokasi, 
                e.banner_image, 
                e.kategori, 
                e.harga_tiket,
                -- Subquery untuk cek status bookmark user saat ini
                (SELECT COUNT(*) FROM bookmarks b WHERE b.event_id = e.event_id AND b.user_id = ?) AS is_bookmarked
            FROM events e
            WHERE 1=1 
        `;
        
        // Parameter awal untuk query utama (user_id untuk subquery bookmark)
        // Jika userId null, kita kasih 0 agar subquery tidak error dan hasilnya 0 (false)
        const params = [userId || 0];

        // 2. Filter-filter (Sama seperti sebelumnya)
        if (search) {
            query += ` AND e.nama_acara LIKE ?`;
            params.push(`%${search}%`);
        }
        if (category) {
            query += ` AND e.kategori = ?`;
            params.push(category);
        }
        if (month && year) {
            query += ` AND MONTH(e.tanggal_mulai) = ? AND YEAR(e.tanggal_mulai) = ?`;
            params.push(month, year);
        }
        if (startDate && endDate) {
            query += ` AND DATE(e.tanggal_mulai) BETWEEN ? AND ?`;
            params.push(startDate, endDate);
        }

        query += ` ORDER BY e.tanggal_mulai ASC`;

        const [rows] = await db.query(query, params);
        
        // Konversi is_bookmarked dari 1/0 (Int) jadi true/false (Boolean) agar enak di Frontend
        const finalData = rows.map(event => ({
            ...event,
            is_bookmarked: event.is_bookmarked > 0 // Jadi true jika 1, false jika 0
        }));

        res.status(200).json({
            success: true,
            data: finalData
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getCategories = async (req, res) => {
    try {
        // SELECT DISTINCT agar tidak ada kategori kembar yang muncul
        const query = `SELECT DISTINCT kategori FROM events WHERE kategori IS NOT NULL AND kategori != '' ORDER BY kategori ASC`;
        
        const [rows] = await db.query(query);

        // Ubah format jadi array string sederhana: ['Seminar', 'Workshop', 'Lomba']
        const categories = rows.map(item => item.kategori);

        res.status(200).json({
            success: true,
            data: categories
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal ambil kategori', error: error.message });
    }
};

exports.getEventById = async (req, res) => {
    try {
        const { id } = req.params; // Ambil ID dari URL

        const query = `
            SELECT 
                e.*, 
                u.nama AS nama_creator 
            FROM events e
            LEFT JOIN users u ON e.creator_id = u.user_id
            WHERE e.event_id = ?
        `;

        const [rows] = await db.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Event tidak ditemukan' });
        }

        res.status(200).json({
            success: true,
            data: rows[0] // Kirim objek tunggal (bukan array)
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// 2. TAMBAH EVENT (Butuh Login)
exports.createEvent = async (req, res) => {
    try {
        const { 
            nama_acara, deskripsi, tanggal_mulai, lokasi, 
            kategori, kuota_maksimal, harga_tiket, contact_person 
        } = req.body;

        // Validasi
        if (!nama_acara || !tanggal_mulai || !lokasi) {
            return res.status(400).json({ message: 'Nama acara, tanggal, dan lokasi wajib diisi!' });
        }

        // Ambil ID dari Token (Otomatis dari authMiddleware)
        const userId = req.user ? req.user.id : null;
        const bannerImage = req.file ? req.file.filename : 'default_event.jpg';
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const query = `
            INSERT INTO events 
            (nama_acara, deskripsi, tanggal_mulai, lokasi, kategori, kuota_maksimal, harga_tiket, contact_person,banner_image, creator_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(query, [
            nama_acara, deskripsi, tanggal_mulai, lokasi, kategori, 
            kuota_maksimal || 0, 
            harga_tiket || 0, 
            contact_person || '-', 
            bannerImage,
            userId
        ]);

        const protocol = req.protocol; 
        const host = req.get('host'); 
        const fullImageUrl = `${protocol}://${host}/uploads/${bannerImage}`;

        res.status(201).json({
            success: true,
            message: 'Event berhasil ditambahkan',
            data: { 
                event_id: result.insertId, 
                nama_acara,
                image_url: fullImageUrl // Kirim URL lengkap agar mudah dipakai frontend
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal tambah event', error: error.message });
    }
};

// 3. EDIT EVENT (Butuh Login - Frontend yang filter tombolnya)
exports.updateEvent = async (req, res) => {
    try {
        const { id } = req.params; // ID Event dari URL
        const { 
            nama_acara, deskripsi, tanggal_mulai, lokasi, 
            kategori, kuota_maksimal, harga_tiket, contact_person 
        } = req.body;

        // Cek apakah event ada?
        const [check] = await db.query('SELECT * FROM events WHERE event_id = ?', [id]);
        if (check.length === 0) {
            return res.status(404).json({ message: 'Event tidak ditemukan' });
        }

        // Update semua kolom (kecuali creator_id)
        const query = `
            UPDATE events SET 
            nama_acara = ?, deskripsi = ?, tanggal_mulai = ?, lokasi = ?, 
            kategori = ?, kuota_maksimal = ?, harga_tiket = ?, contact_person = ?
            WHERE event_id = ?
        `;

        await db.query(query, [
            nama_acara, deskripsi, tanggal_mulai, lokasi, 
            kategori, kuota_maksimal, harga_tiket, contact_person,
            id
        ]);

        res.status(200).json({
            success: true,
            message: 'Event berhasil diperbarui'
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal update event', error: error.message });
    }
};

// 4. HAPUS EVENT (Butuh Login - Frontend yang filter tombolnya)
exports.deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;

        const [check] = await db.query('SELECT * FROM events WHERE event_id = ?', [id]);
        if (check.length === 0) {
            return res.status(404).json({ message: 'Event tidak ditemukan' });
        }

        await db.query('DELETE FROM events WHERE event_id = ?', [id]);

        res.status(200).json({
            success: true,
            message: 'Event berhasil dihapus'
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal hapus event', error: error.message });
    }
};