import { Button } from "@/components/ui/button";
import GoogleLogo from "@/components/google-logo";
import { signInWithGoogle } from "@/utils/utils";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { LayoutDashboard, Loader2, LogIn, LogOut } from "lucide-react"; 
import { useRouter } from "next/navigation";

export default function SignIn() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [signingIn, setSigningIn] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [navigating, setNavigating] = useState(false);

  const handleSignIn = async () => {
    setSigningIn(true);
    await signInWithGoogle();
    setSigningIn(false);
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
  };

  const handleNavigate = async () => {
    setNavigating(true);
    router.push("/dashboard");
  };

  return (
    <div className="h-screen bg-forest relative font-main shadow-md flex items-center justify-center">
      <div className="absolute top-0 right-0 w-72 opacity-20 z-0">
        <img src="/cta_right.webp" alt="Decorative" className="w-full h-auto" />
      </div>
      <div className="absolute bottom-0 left-0 w-72 opacity-20 z-0">
        <img src="/cta_left.webp" alt="Decorative" className="w-full h-auto" />
      </div>

      <div className="p-8 w-full max-w-md animate-fadeIn text-center">
        <div className="flex items-center justify-start gap-2">
          <img src="/logo.svg" alt="ApproveIt Logo" className="h-10" />
          <h1 className="border-l-2 text-4xl p-2 text-white/95 text-left mb-4 tracking-tighter">
            APPROVEIT
          </h1>
        </div>

        {loading ? (
          <div className="flex justify-center mt-6">
            <Loader2 className="animate-spin text-white" size={48} />
          </div>
        ) : user ? (
          <>
            <p className="text-gray-200 text-left mb-4">
              Go to your dashboard to manage your approvals effortlessly.
            </p>

            <Button
              onClick={handleNavigate}
              disabled={navigating}
              className="relative z-25 font-main bg-white/95 w-full text-forest hover:bg-white/90 text-lg h-12 px-8 rounded-full group"
            >
              {navigating ? (
                <Loader2 className="animate-spin text-forest" size={20} />
              ) : (
                <LayoutDashboard className="mr-2 h-4 w-4" />
              )}
              Dashboard
            </Button>

            <Button
              onClick={handleSignOut}
              disabled={signingOut}
              className="mt-4 relative z-25 font-main bg-red-800/95 w-full text-white hover:bg-red-800/90 text-lg h-12 px-8 rounded-full group"
            >
              {signingOut ? (
                <Loader2 className="animate-spin text-white" size={20} />
              ) : (
                <LogOut className="mr-2 h-4 w-4" />
              )}
              Sign Out
            </Button>
          </>
        ) : (
          <>
            <p className="text-gray-200 text-left mb-4">
              Sign in to manage your approvals effortlessly.
            </p>

            <Button
              onClick={handleSignIn}
              disabled={signingIn}
              className={`relative z-25 text-md w-full flex items-center justify-center h-12 rounded-full shadow-sm 
                ${signingIn ? "bg-gray-100 cursor-not-allowed text-forest" : "bg-gray-100 hover:bg-gray-200 text-forest"}
              `}
            >
              {signingIn ? (
                <Loader2 className="animate-spin text-gray-600" size={20} />
              ) : (
                <>
                  <GoogleLogo className="h-5 w-5 z-25" />
                </>
              )}
                <span className="tracking-tighter z-25 ml-2">
                    Sign In With Google
                </span>
            </Button>
          </>
        )}

        <div className="border-t border-gray-700 my-6"></div>
      </div>
    </div>
  );
}
