import React from "react";
import styles from "./page.module.css";
import Image from "next/image";
import Button from "@/components/Button/button";
import Ensa from "../../../public/images/ensa.jpg";

const About = () => {
  return (
    <div className={styles.container}>
      <div className={styles.imgContainer}>
        <Image
          src={Ensa}
          fill={true}
          alt=""
          className={styles.img}
        />
        <div className={styles.imgText}>
          <h1 className={styles.imgTitle}>Digital Storytellers</h1>
          <h2 className={styles.imgDesc}>
            Handcrafting award winning digital experiences
          </h2>
        </div>
      </div>
      <div className={styles.textContainer}>
        <div className={styles.item}>
          <h1 className={styles.title}>Who Are We?</h1>
          <p className={styles.desc}>
            Excellia is a cutting-edge web platform designed to streamline the 
            scholarship application process for students at all academic levels, 
            from preparatory classes to doctoral studies. Our mission is to 
            provide a seamless, transparent, and efficient system for managing 
            scholarships, ensuring equal opportunities for deserving candidates. 
            <br />
            <br />
            By integrating modern DevOps practices and AI-powered analysis, 
            Excellia optimizes application reviews, enhances security, and 
            accelerates decision-making for institutions and scholarship providers.
          </p>

        </div>
        <div className={styles.item}>
          <h1 className={styles.title}>What We Do?</h1>
          <p className={styles.desc}>
            Excellia simplifies scholarship management through:  
            <br />
            <br /> - Automated Application Processing
            <br />
            <br /> - AI-Based Eligibility Analysis 
            <br />
            <br /> - Secure and Scalable Cloud Infrastructure 
            <br />
            <br /> - Real-Time Status Tracking
            <br />
            <br /> - Efficient Communication Between Students & Institutions
          </p>

          <Button url="/contact" text="Contact" />
        </div>
      </div>
    </div>
  );
};

export default About;