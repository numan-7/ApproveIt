import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignIn() {
  return (
    <div className="h-screen bg-zinc-200 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 z-0">
        <img src="/cta_right.webp" alt="" className="w-full h-auto" />
      </div>
      <div className="absolute bottom-0 left-0 w-64 z-0">
        <img src="/cta_left.webp" alt="" className="w-full h-auto" />
      </div>
      <div className="container mx-auto flex items-center justify-center min-h-full p-8 z-10">
        <div className="w-full max-w-md z-10">
          <h2 className="text-3xl mb-8 text-left text-secondary tracking-tighter">Sign In</h2>
          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                type="email"
                id="email"
                placeholder="Enter your email"
                className="h-12 px-4 rounded-lg border-gray-200 focus:border-secondary focus:ring-secondary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                type="password"
                id="password"
                placeholder="Enter your password"
                className="h-12 px-4 rounded-lg border-gray-200 focus:border-secondary focus:ring-secondary"
              />
            </div>
            <Button className="w-full bg-secondary hover:bg-secondary/90 text-white h-12 rounded-lg">Sign In</Button>
          </form>
          <div className="mt-6 text-center">
            <a href="#" className="text-sm text-secondary hover:underline">
              Forgot password?
            </a>
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <a href="#" className="text-secondary hover:underline">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

