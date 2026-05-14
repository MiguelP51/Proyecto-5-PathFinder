import LoginCard from "@/components/LoginCard";
import styles from "../../../styles/LoginRegister.module.css"

export default function Login() {
    return (
        <main>
            <div className={styles.container}>
                <LoginCard />
            </div>

        </main>
    );
}