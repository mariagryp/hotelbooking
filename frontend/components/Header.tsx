import Link from "next/link";
import Image from "next/image";
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import {
  LoginLink,
  RegisterLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import { Button } from "./ui/button";
import Dropdown from "./Dropdown";
import MobileNav from "./MobileNav";
import Nav from "./Nav";

const socials = [
  { icon: <FaYoutube />, href: "#" },
  { icon: <FaFacebook />, href: "#" },
  { icon: <FaInstagram />, href: "#" },
  { icon: <FaTwitter />, href: "#" },
];

const Header = async () => {
  const { isAuthenticated, getUser } = getKindeServerSession();
  const isUserAuthenticated = await isAuthenticated();
  const user = await getUser();

  return (
    <header className="py-6 shadow-md">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between gap-6">
          {/* logo & social icons*/}
          <div className="flex items-center gap-5 justify-center xl:w-max">
            {/* logo */}
            <Link href="/">
              <Image src="/assets/logo.svg" width={160} height={160} alt="" />
            </Link>
            {/*  seporator*/}
            <div className="w-[1px] h-[40px] bg-gray-300 "></div>
            {/* social icons */}
            <div className="flex gap-2">
              {socials.map((item, index) => {
                return (
                  <Link
                    href={item.href}
                    key={index}
                    className="bg-accent text-white hover:bg-accent-hover text-sm w-[28px] h-[28px] flex items-center justify-center rounded-full transition-all "
                  >
                    {item.icon}
                  </Link>
                );
              })}
            </div>
          </div>
          {/* sign in & sign out */}
          <div className="flex items-center justify-center gap-8 xl:w-max ">
            <div className="flex items-center gap-2 xl:order-2">
              {isUserAuthenticated ? (
                <Dropdown user={user} />
              ) : (
                <div className="flex gap-2">
                  <LoginLink>
                    <Button>Sign In</Button>
                  </LoginLink>
                  <RegisterLink>
                    <Button variant="primary">Register</Button>
                  </RegisterLink>
                </div>
              )}
            </div>

            {/* mobile nav */}
            <div className="xl:hidden">
              {/* Остановилась тут 1.51 */}
              <MobileNav />
            </div>
            {/* desktop nav */}
            <div className="hidden xl:flex">
              <Nav isUserAuthenticated={isUserAuthenticated}/>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
