const db = require('../config/database');
const jwt = require('jsonwebtoken');

exports.getAllEvents = async (req, res) => {
    try {
        const { search, category, month, year, startDate, endDate } = req.query;
        
        let userId = null;
        const authHeader = req.header('Authorization');
        if (authHeader) {
            const token = authHeader.replace('Bearer ', '');
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.id;
            } catch (err) {
               
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
                e.kuota_maksimal,
                e.contact_person,
                -- Subquery untuk cek status bookmark user saat ini
                (SELECT COUNT(*) FROM bookmarks b WHERE b.event_id = e.event_id AND b.user_id = ?) AS is_bookmarked
            FROM events e
            WHERE 1=1 
        `;
        
        const params = [userId || 0];

        // 3. FILTER LOGIC
        if (search) {
            query += ` AND e.nama_acara LIKE ?`;
            params.push(`%${search}%`);
        }
        if (category) {
            query += ` AND e.kategori = ?`;
            params.push(category);
        }
        // Filter Kalender (Bulan & Tahun)
        if (month && year) {
            query += ` AND MONTH(e.tanggal_mulai) = ? AND YEAR(e.tanggal_mulai) = ?`;
            params.push(month, year);
        }
        // Filter Rentang Tanggal
        if (startDate && endDate) {
            query += ` AND DATE(e.tanggal_mulai) BETWEEN ? AND ?`;
            params.push(startDate, endDate);
        }

        query += ` ORDER BY e.tanggal_mulai ASC`;

        const [rows] = await db.query(query, params);
        
        const finalData = rows.map(event => ({
            ...event,
            is_bookmarked: event.is_bookmarked > 0, 

            image_url: event.banner_image 
        }));

        res.status(200).json({
            success: true,
            message: 'Berhasil mengambil data event',
            data: finalData
        });

    } catch (error) {
        console.error("Error getAllEvents:", error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const query = `SELECT DISTINCT kategori FROM events WHERE kategori IS NOT NULL AND kategori != '' ORDER BY kategori ASC`;
        
        const [rows] = await db.query(query);

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
        const { id } = req.params;

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

        const event = rows[0];

        const protocol = req.protocol;
        const host = req.get('host');
        const fullImageUrl = event.banner_image 
            ? `${protocol}://${host}/uploads/${event.banner_image}` 
            : null;
        const eventData = {
            ...event,
            image_url: fullImageUrl
        };

        res.status(200).json({
            success: true,
            data: eventData
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

        if (!nama_acara || !tanggal_mulai || !lokasi) {
            return res.status(400).json({ message: 'Wajib diisi!' });
        }

        const userId = req.user ? req.user.id : null;
        
        let bannerImage = null;
        if (req.file) {
            bannerImage = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        }

        const query = `
            INSERT INTO events 
            (nama_acara, deskripsi, tanggal_mulai, lokasi, kategori, kuota_maksimal, harga_tiket, contact_person, banner_image, creator_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(query, [
            nama_acara, deskripsi, tanggal_mulai, lokasi, kategori, 
            kuota_maksimal || 0, harga_tiket || 0, contact_person || '-', 
            bannerImage,
            userId
        ]);

        res.status(201).json({
            success: true,
            message: 'Event berhasil ditambahkan',
            data: { event_id: result.insertId }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal tambah event', error: error.message });
    }
};

// 3. EDIT EVENT
exports.updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            nama_acara, deskripsi, tanggal_mulai, lokasi, 
            kategori, kuota_maksimal, harga_tiket, contact_person 
        } = req.body;

        const [oldData] = await db.query('SELECT banner_image FROM events WHERE event_id = ?', [id]);
        if (oldData.length === 0) return res.status(404).json({ message: 'Event tidak ditemukan' });

        let bannerImage = oldData[0].banner_image;
        if (req.file) {
            bannerImage = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        }

        const query = `
            UPDATE events SET 
            nama_acara = ?, deskripsi = ?, tanggal_mulai = ?, lokasi = ?, 
            kategori = ?, kuota_maksimal = ?, harga_tiket = ?, contact_person = ?,
            banner_image = ? 
            WHERE event_id = ?
        `;

        await db.query(query, [
            nama_acara, deskripsi, tanggal_mulai, lokasi, 
            kategori, kuota_maksimal || 0, harga_tiket || 0, contact_person,
            bannerImage,
            id
        ]);

        res.status(200).json({ success: true, message: 'Event berhasil diperbarui' });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal update', error: error.message });
    }
};

// 4. HAPUS EVENT
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