// Backend API URL'si
const apiUrl = 'http://localhost:3000/api';

// Tüm yemekleri listeleme
async function getMeals() {
    try {
        const response = await fetch(`${apiUrl}/meals`);
        const meals = await response.json();

        const mealList = document.getElementById('meal-list');
        mealList.innerHTML = '';

        meals.forEach(meal => {
            const mealDiv = document.createElement('div');
            mealDiv.className = 'grid-item';
            mealDiv.innerHTML = `
                <h3>${meal.name}</h3>
                <p>${meal.description}</p>
                <p><strong>Fiyat:</strong> ${meal.price} TL</p>
                <p><strong>Kategori:</strong> ${meal.category}</p>
            `;
            mealList.appendChild(mealDiv);
        });
    } catch (error) {
        console.error('Yemekler alınırken hata oluştu:', error);
    }
}

// Tüm siparişleri listeleme
async function getOrders() {
    try {
        const response = await fetch(`${apiUrl}/orders`);
        const orders = await response.json();

        const orderList = document.getElementById('order-list');
        orderList.innerHTML = '';

        orders.forEach(order => {
            const orderDiv = document.createElement('div');
            orderDiv.className = 'grid-item';
            orderDiv.innerHTML = `
                <h3>${order.customerName}</h3>
                <p><strong>Sipariş Durumu:</strong> ${order.status}</p>
                <p><strong>Toplam Tutar:</strong> ${order.totalAmount} TL</p>
                <p><strong>Öğeler:</strong></p>
                <ul>
                    ${order.items.map(item => `<li>${item.mealId.name} - ${item.quantity} adet</li>`).join('')}
                </ul>
                <button onclick="deleteOrder('${order._id}')">Sil</button>
            `;
            orderList.appendChild(orderDiv);
        });
    } catch (error) {
        console.error('Siparişler alınırken hata oluştu:', error);
    }
}

// Sipariş silme
async function deleteOrder(orderId) {
    try {
        const response = await fetch(`${apiUrl}/orders/${orderId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Sipariş başarıyla silindi.');
            getOrders(); // Siparişleri yeniden yükle
        } else {
            alert('Sipariş silinirken hata oluştu.');
        }
    } catch (error) {
        console.error('Sipariş silinirken hata oluştu:', error);
    }
}

// Yeni yemek ekleme
document.getElementById('meal-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const newMeal = {
        name: document.getElementById('name').value,
        price: document.getElementById('price').value,
        description: document.getElementById('description').value,
        category: document.getElementById('category').value,
    };

    try {
        const response = await fetch(`${apiUrl}/meals`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newMeal),
        });

        if (response.ok) {
            alert('Yeni yemek eklendi.');
            getMeals(); // Yemekleri yeniden yükle
        } else {
            alert('Yemek eklenirken hata oluştu.');
        }
    } catch (error) {
        console.error('Yemek eklenirken hata oluştu:', error);
    }
});

// Sayfa yüklendiğinde yemekleri ve siparişleri getir
window.onload = function() {
    getMeals();
    getOrders();
    setInterval(getOrders, 5000); // Siparişleri her 5 saniyede bir yeniden yükle
};
