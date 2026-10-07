import type { Metadata } from "next";
export const metadata:Metadata={title:{default:"Admin | USCHH",template:"%s | USCHH Admin"},robots:{index:false,follow:false},referrer:"no-referrer"};
export default function AdminRootLayout({children}: {children:React.ReactNode}){return children;}
