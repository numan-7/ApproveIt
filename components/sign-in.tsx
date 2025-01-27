import { Button } from "@/components/ui/button";
import GoogleLogo from "@/components/google-logo";

export default function SignIn() {
  return (
    <div className="h-screen bg-forest relative font-main shadow-md">
      <div className="absolute top-0 right-0 w-72 opacity-20 z-0">
        <img src="/cta_right.webp" alt="Decorative" className="w-full h-auto" />
      </div>
      <div className="absolute bottom-0 left-0 w-72 opacity-20 z-0">
        <img src="/cta_left.webp" alt="Decorative" className="w-full h-auto" />
      </div>

      <div className="container mx-auto flex items-center justify-center min-h-full p-4 z-10">
        <div className="p-8 w-full max-w-md animate-fadeIn">
          <div className="flex items-center justify-start gap-2">
            <img src="/logo.svg" alt="ApproveIt Logo" className="h-10" />
            <h1 className="border-l-2 text-4xl p-2 text-white/95 text-left mb-4 tracking-tighter">
               APPROVEIT
            </h1>
          </div>

          <p className="text-gray-200 text-left mb-4">
            Sign in to manage your approvals effortlessly.
          </p>

          <Button className="w-full bg-gray-100 text-gray-800 hover:bg-gray-200 flex items-center justify-center h-12 rounded-lg shadow-sm">
            <GoogleLogo className="h-5 w-5" />
            <span className="tracking-tighter ml-2">Sign In With Google</span>
          </Button>

          <div className="border-t border-gray-700 my-6"></div>
        </div>
      </div>
    </div>
  );
}