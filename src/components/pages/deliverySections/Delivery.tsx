"use client";
import { FC, useState, useMemo } from "react";
import scss from "./Delivery.module.scss";

type OrderStatus = "processing" | "shipping" | "delivered";

interface Order {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  buyer: string;
  address: string;
  phone: string;
  deliveryMethod: "courier" | "pickup" | "post";
  totalAmount: number;
  date: string;
  items: { name: string; quantity: number; price: number }[];
}

const mockOrders: Order[] = [
  {
    id: 1,
    orderNumber: "#101",
    status: "processing",
    buyer: "Иван Иванов",
    address: "Москва, ул. Ленина, д. 10, кв. 25",
    phone: "+7 (999) 123-45-67",
    deliveryMethod: "courier",
    totalAmount: 5490,
    date: "2025-12-20 14:30",
    items: [
      { name: "Кроссовки Nike Air", quantity: 1, price: 4490 },
      { name: "Носки (3 пары)", quantity: 1, price: 1000 },
    ],
  },
  {
    id: 2,
    orderNumber: "#102",
    status: "shipping",
    buyer: "Анна Петрова",
    address: "Санкт-Петербург, Невский пр., д. 50",
    phone: "+7 (911) 987-65-43",
    deliveryMethod: "post",
    totalAmount: 3200,
    date: "2025-12-22 09:15",
    items: [{ name: "Футболка Polo", quantity: 2, price: 1600 }],
  },
  {
    id: 3,
    orderNumber: "#103",
    status: "delivered",
    buyer: "Сергей Сидоров",
    address: "Казань, ул. Баумана, д. 15",
    phone: "+7 (903) 555-44-33",
    deliveryMethod: "pickup",
    totalAmount: 8900,
    date: "2025-12-18 11:00",
    items: [
      { name: "Джинсы Levi's", quantity: 1, price: 6900 },
      { name: "Ремень кожаный", quantity: 1, price: 2000 },
    ],
  },
];

const statusLabels: Record<OrderStatus, string> = {
  processing: "Обрабатывается",
  shipping: "В пути",
  delivered: "Доставлено",
};

const statusColors: Record<OrderStatus, string> = {
  processing: scss.statusProcessing,
  shipping: scss.statusShipping,
  delivered: scss.statusDelivered,
};

const Delivery: FC = () => {
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = useMemo(() => {
    if (filterStatus === "all") return mockOrders;
    return mockOrders.filter((order) => order.status === filterStatus);
  }, [filterStatus]);

  const getProgressStep = (status: OrderStatus) => {
    const steps: OrderStatus[] = ["processing", "shipping", "delivered"];
    return steps.indexOf(status);
  };

  return (
    <section className={scss.Delivery}>
      <div className="container">
        <div className={scss.header}>
          <h1 className={scss.title}>Последние заказы</h1>

          <select
            className={scss.filter}
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as OrderStatus | "all")
            }
          >
            <option value="all">Все</option>
            <option value="processing">Обрабатывается</option>
            <option value="shipping">В пути</option>
            <option value="delivered">Доставлено</option>
          </select>
        </div>

        {filteredOrders.length === 0 ? (
          <div className={scss.empty}>Нет заказов с выбранным статусом</div>
        ) : (
          <div className={scss.ordersGrid}>
            {filteredOrders.map((order) => (
              <div key={order.id} className={scss.orderCard}>
                <div className={scss.cardHeader}>
                  <h3 className={scss.orderNumber}>
                    Заказ {order.orderNumber}
                  </h3>
                  <span
                    className={`${scss.status} ${statusColors[order.status]}`}
                  >
                    {statusLabels[order.status]}
                  </span>
                </div>

                <div className={scss.cardInfo}>
                  <p>
                    <strong>Покупатель:</strong> {order.buyer}
                  </p>
                  <p className={scss.mobileHide}>
                    <strong>Адрес:</strong> {order.address}
                  </p>
                  <p className={scss.mobileHide}>
                    <strong>Телефон:</strong> {order.phone}
                  </p>
                  <p className={scss.mobileHide}>
                    <strong>Доставка:</strong>{" "}
                    {order.deliveryMethod === "courier"
                      ? "Курьер"
                      : order.deliveryMethod === "pickup"
                      ? "Самовывоз"
                      : "Почта"}
                  </p>
                  <p>
                    <strong>Сумма:</strong> {order.totalAmount.toLocaleString()}{" "}
                    ₽
                  </p>
                  <p className={scss.mobileHide}>
                    <strong>Дата:</strong> {order.date}
                  </p>
                </div>

                <div className={scss.progressBar}>
                  {["processing", "shipping", "delivered"].map((step, idx) => {
                    const currentStep = getProgressStep(order.status);
                    const isActive = idx <= currentStep;
                    const isCurrent = idx === currentStep;
                    return (
                      <div
                        key={step}
                        className={`${scss.progressStep} ${
                          isActive ? scss.active : ""
                        } ${isCurrent ? scss.current : ""}`}
                      >
                        <span className={scss.stepDot}></span>
                        <span className={scss.stepLabel}>
                          {statusLabels[step as OrderStatus]}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <button
                  className={scss.detailsBtn}
                  onClick={() => setSelectedOrder(order)}
                >
                  Посмотреть детали
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedOrder && (
        <div
          className={scss.modalOverlay}
          onClick={() => setSelectedOrder(null)}
        >
          <div className={scss.modal} onClick={(e) => e.stopPropagation()}>
            <button
              className={scss.closeBtn}
              onClick={() => setSelectedOrder(null)}
            >
              ×
            </button>

            <h2 className={scss.modalTitle}>
              Заказ {selectedOrder.orderNumber}
            </h2>
            <p className={scss.modalDate}>Дата: {selectedOrder.date}</p>

            <div className={scss.modalSection}>
              <h3>Информация о покупателе</h3>
              <p>
                <strong>Покупатель:</strong> {selectedOrder.buyer}
              </p>
              <p>
                <strong>Адрес:</strong> {selectedOrder.address}
              </p>
              <p>
                <strong>Телефон:</strong> {selectedOrder.phone}
              </p>
              <p>
                <strong>Способ доставки:</strong>{" "}
                {selectedOrder.deliveryMethod === "courier"
                  ? "Курьер"
                  : selectedOrder.deliveryMethod === "pickup"
                  ? "Самовывоз"
                  : "Почта"}
              </p>
            </div>

            <div className={scss.modalSection}>
              <h3>Товары в заказе</h3>
              <ul className={scss.itemsList}>
                {selectedOrder.items.map((item, idx) => (
                  <li key={idx}>
                    {item.name} — {item.quantity} шт. × {item.price} ₽
                  </li>
                ))}
              </ul>
              <p className={scss.total}>
                <strong>
                  Итого: {selectedOrder.totalAmount.toLocaleString()} ₽
                </strong>
              </p>
            </div>

            <div className={scss.modalSection}>
              <h3>Статус заказа</h3>
              <div className={scss.modalProgress}>
                {["processing", "shipping", "delivered"].map((step, idx) => {
                  const currentStep = getProgressStep(selectedOrder.status);
                  const isActive = idx <= currentStep;
                  const isCurrent = idx === currentStep;
                  return (
                    <div
                      key={step}
                      className={`${scss.progressStep} ${
                        isActive ? scss.active : ""
                      } ${isCurrent ? scss.current : ""}`}
                    >
                      <span className={scss.stepDot}></span>
                      <span className={scss.stepLabel}>
                        {statusLabels[step as OrderStatus]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Здесь в будущем можно добавить кнопки изменения статуса для админа */}
          </div>
        </div>
      )}
    </section>
  );
};

export default Delivery;
