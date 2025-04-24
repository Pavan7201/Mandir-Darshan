import React from "react";
import "../css/bdy.css";

const Body = () => {
  return (
    <main className="body">
      <section id="home">
        <h2>Welcome to Our Temple</h2>
        <p>Experience peace and spirituality.</p>
      </section>

      <section id="about">
        <h2>About the Temple</h2>
        <p>This temple has a rich cultural heritage...</p>
      </section>

      <section id="services">
        <h2>Our Services</h2>
        <ul>
          <li>Pooja Booking</li>
          <li>Prasadam Delivery</li>
          <li>Online Darshan</li>
        </ul>
      </section>

      <section id="contact">
        <h2>Contact Us</h2>
        <p>Email: temple@example.com</p>
      </section>
    </main>
  );
};

export default Body;
