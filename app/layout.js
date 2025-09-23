import Link from "next/link";
import "./globals.css";
import NavAuth from "./components/NavAuth";

const RootLayout = ({ children }) => {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <nav className="bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex justify-between items-center py-4">
                <Link href="/" className="text-xl font-bold text-blue-600">
                  RecruitHub
                </Link>
                <div className="flex space-x-4">
                  <NavAuth />
                </div>
              </div>
            </div>
          </nav>

          <main className="max-w-7xl mx-auto py-10 px-4">{children}</main>
        </div>
      </body>
    </html>
  );
};

export default RootLayout;
