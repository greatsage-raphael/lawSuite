import { IconBrandGithub, IconBrandTwitter } from "@tabler/icons-react";
import Link from "next/link";
import { FC } from "react";

export const Footer: FC = () => {
  return (
    <div className="flex h-[50px] w-full pt-4 border-t-2 border-gray-300 py-2 px-8 items-center sm:justify-between justify-center">
      
      <Link 
         href='http://mwambazi-collins.vercel.app/'
         target='_blank'
         rel='noopener noreferrer'>
           Built with 🎧 & ❤️ in kampala.
        </Link>

        <div className="flex space-x-4">
        <a
          className="flex items-center hover:opacity-50"
          href="https://twitter.com/thesupremesage"
          target="_blank"
          rel="noreferrer"
        >
          <IconBrandTwitter size={24} />
        </a>

        <a
          className="flex items-center hover:opacity-50"
          href="https://github.com/greatsage-raphael/TheConstitutionOfUganda"
          target="_blank"
          rel="noreferrer"
        >
          <IconBrandGithub size={24} />
        </a>
      </div>

    </div>
  );
};
