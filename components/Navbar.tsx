import { IconExternalLink } from "@tabler/icons-react";
import { FC } from "react";
import Link from "next/link";


export const Navbar: FC = () => {
  return (
    <nav className="font-sans flex justify-between pt-4 pb-20 px-4 md:px-20 w-full h-2 border-b border-gray-300">
    <div className="flex gap-4 md:gap-10 font-bold text-2xl">
    <Link href="/">
      <div className="text-2xl no-underline text-grey-darkest hover:text-blue-700">LawSuite💼</div>
    </Link> <br/>
    <Link href="/upload">
      <div className="text-2xl no-underline text-grey-darkest hover:text-blue-700"> Upload ⬆️</div> 
    </Link>
    </div>
    <div className="font-bold text-1xl  hover:text-blue-700">
        <Link
          className="flex items-center hover:opacity-50"
           href="https://the-constitution-of-uganda.vercel.app/"
           target="_blank"
           rel="noreferrer"
        >
          <div className="hidden sm:flex">The Law Vault UG</div>

    
    <IconExternalLink
      className="ml-1"
        size={20}
        />
        </Link>
     </div>
  </nav>
  );
};
