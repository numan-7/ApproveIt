import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import SignIn from "./SignIn";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function Header() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="mx-6 h-16 flex justify-between items-center">
        <Link to="/">
          <img src="/logo.png" alt="ApproveIt" className="h-10" />
        </Link>
        <span className="text-2xl text-white tracking-tighter font-semibold">
          APPROVEIT
        </span>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white">
              <Menu className="h-8 w-8" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>

          <SheetContent className="w-full sm:w-[540px] p-0 backdrop-blur-md bg-white">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 z-50 text-gray-800 hover:bg-gray-200"
              onClick={() => setIsSheetOpen(false)}
            >
              <X className="h-6 w-6" />
              <span className="sr-only">Close menu</span>
            </Button>
            <SignIn />
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
