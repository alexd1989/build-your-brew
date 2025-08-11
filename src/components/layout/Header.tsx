import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, UserCircle2, FileText } from "lucide-react";

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `${isActive ? "text-primary" : "text-foreground/80 hover:text-foreground"} transition-colors`;

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <FileText className="h-5 w-5 text-primary" />
          <span>Resume Builder</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/" end className={linkCls}>
            Build Resume
          </NavLink>
          <NavLink to="/dashboard" className={linkCls}>
            My Resumes
          </NavLink>
          <NavLink to="/settings" className={linkCls}>
            Settings
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}> 
                <UserCircle2 className="h-4 w-4 mr-2" /> Dashboard
              </Button>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => navigate("/auth")}> 
              <LogIn className="h-4 w-4 mr-2" /> Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
