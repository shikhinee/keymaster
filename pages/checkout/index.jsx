//Next, React (core node_modules) imports must be placed here
import { useRouter } from "next/router";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { motion } from "framer-motion";
//import STORE from '@/store'
import { CartContext } from "@/store/CartContext";
//import LAYOUT from '@/layouts'
import LandingLayout from "@/layouts/Landing";
//import VIEWS from '@/views'

//import useFETCHER from '@/tools'

//import COMPOSITES from '@/composites'
import ProductReqVerify from "@/composites/ProductReqVerify";
import ProductCard from "@/composites/ProductCard";
//import COMPONENT from '@/components'

import styles from "./Checkout.module.scss";

const CheckoutPage = (props) => {
  const router = useRouter();
  const { firstName, lastName, email, phoneNumber } = router.query;
  const { orders, addOrder, deleteOrder } = useContext(CartContext);
  const [isFetched, setIsFetched] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [form, setForm] = useState({
    firstName: firstName,
    lastName: lastName,
    email: email,
    phoneNumber: phoneNumber,
  });

  useEffect(() => {
    const controller = new AbortController();

    axios
      .get("/api/product", { signal: controller.signal })
      .then(({ data }) => {
        setProducts(data.data);
        setIsFetched(true);
      })
      .catch((err) => {
        console.log("CheckoutPage Fetch Aborted", err);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const filteredOrders = products.filter((product) => {
      return orders.find((order) => {
        product.quantity = order.quantity;
        return order.productID === product._id;
      });
    });

    setFilteredProducts(filteredOrders);
  }, [isFetched, orders, products]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    const productReq = {
      ...form,
      productInfo: filteredProducts.map((product) => {
        return {
          quantity: product.quantity,
          productID: product._id,
        };
      }),
    };

    axios.post("/api/productReq", productReq).then((res) => {
      console.log(res)
      if (res.status === 201) {
        addOrder(filteredProducts);
        deleteOrder();
        router.push("/checkout/success");
      }
    })
    .catch((err) => {
      console.log("ProductReq handleSubmit:", err);
    });
  };

  return (
    <motion.main exit={{ opacity: 0 }}
		initial={{ opacity: 0 }}
		animate={{ opacity: 1 }}
		transition={{ duration: 1 }}
    className={styles.container}>
      <div className={styles.content}>
        <ProductReqVerify
          firstName={firstName}
          lastName={lastName}
          email={email}
          phoneNumber={phoneNumber}
          handleChange={handleChange}
        />

        <div className={styles.cart}>
          <div className={styles.cartHeader}>
            <h2 className={styles.cartTitle}>Таны Сагс</h2>
            <div className={styles.cartHeaderPrice}>
              <span>Нийт Үнэ</span>
              <span>
                {filteredProducts.reduce((acc, product) => {
                  return acc + product.productPrice * product.quantity;
                }, 0)}
                ₮
              </span>
            </div>
          </div>
          <div className={styles.cartBody}>
            {isFetched &&
              filteredProducts.map((product) => {
                return (
                  <ProductCard
                  key={product._id}
                  _id={product._id}
                  photoLinks={product.photoLinks}
                  productName={product.productName}
                  productPrice={product.productPrice}
                  color={product.color}
                  hexColor={product.hexColor}
                  />
                );
              })}
          </div>
          <button onClick={handleSubmit} className={styles.submitButton}>
              Захиалгаа Баталгаажуулах
         </button>
        </div>
      </div>
    </motion.main>
  );
};

CheckoutPage.Layout = LandingLayout;

export default CheckoutPage;
