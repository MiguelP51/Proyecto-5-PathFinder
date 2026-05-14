import Navbar from "@/components/Navbar";

export default function PublicLayout({
                                         children,
                                     }: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navbar />
            <main style={{ marginTop: "80px" }}>{children}</main>
        </>
    );
}