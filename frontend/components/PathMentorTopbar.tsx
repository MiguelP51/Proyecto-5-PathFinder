'use client';

import styles from '../styles/PathMentorTopbar.module.css';

export default function PathMentorTopbar() {

    return (

        <header className={styles.topbar}>

            <div className={styles.rightSection}>

                <div className={styles.notification}>
                    🔔
                    <span className={styles.badge}>3</span>
                </div>

                <div className={styles.userSection}>

                    <div className={styles.avatar}>
                        👨🏽‍💼
                    </div>

                    <div>
                        <h3>María González</h3>
                        <p>Mentor</p>
                    </div>

                </div>

            </div>

        </header>
    );
}