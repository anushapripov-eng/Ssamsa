const express = require('express');
const bodyParser = require('body-parser');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('dist'));

const ORDERS_FILE = 'orders.json';

const sendTelegramMessage = async (message) => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatIds = [process.env.TELEGRAM_CHAT_ID_1, process.env.TELEGRAM_CHAT_ID_2].filter(Boolean);

    if (!token || chatIds.length === 0) {
        console.error('Telegram ENV not set');
        return false;
    }

    let success = true;
    for (const chatId of chatIds) {
        try {
            const url = `https://api.telegram.org/bot${token}/sendMessage`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'HTML'
                })
            });
            if (!response.ok) {
                console.error(`Telegram API error for chat ${chatId}:`, await response.text());
                success = false;
            }
        } catch (error) {
            console.error(`Error sending to Telegram chat ${chatId}:`, error);
            success = false;
        }
    }
    return success;
};

app.post('/api/order', async (req, res) => {
    const { name, phone, address, comment, items, total } = req.body;

    if (!name || !phone || !items || items.length === 0) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const orderId = Math.floor(1000 + Math.random() * 9000);
    const date = new Date().toLocaleString('ru-RU');

    let itemsText = '';
    items.forEach(item => {
        itemsText += `• ${item.name} × ${item.quantity} = ${item.price * item.quantity}₽\n`;
    });

    const message = `🧾 <b>Новый заказ #${orderId}</b>\n` +
        `📅 ${date}\n\n` +
        `👤 <b>Клиент:</b> ${name}\n` +
        `📞 <b>Телефон:</b> ${phone}\n` +
        `📍 <b>Адрес:</b> ${address || 'Не указан'}\n` +
        `💬 <b>Комментарий:</b> ${comment || '-'}\n\n` +
        `📦 <b>Состав заказа:</b>\n${itemsText}\n` +
        `💰 <b>Итого: ${total}₽</b>`;

    const telegramSent = await sendTelegramMessage(message);

    const orderData = {
        orderId,
        date,
        customer: { name, phone, address, comment },
        items,
        total,
        telegramSent
    };

    try {
        let orders = [];
        if (fs.existsSync(ORDERS_FILE)) {
            const data = fs.readFileSync(ORDERS_FILE, 'utf8');
            orders = JSON.parse(data);
        }
        orders.push(orderData);
        fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
    } catch (error) {
        console.error('Error saving order to file:', error);
    }

    res.json({ success: true, message: 'Заказ принят, мы свяжемся с вами', orderId });
});

app.get('/api/test-telegram', async (req, res) => {
    const success = await sendTelegramMessage('✅ Тест: Telegram работает');
    if (success) {
        res.json({ ok: true, message: 'Тестовое сообщение отправлено' });
    } else {
        res.status(500).json({ ok: false, message: 'Ошибка при отправке. Проверьте ENV.' });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
