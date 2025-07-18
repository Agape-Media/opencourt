import clsx from "clsx";
import { PropsWithChildren } from "react";
import Image from "next/image";
import { MessageCircle } from "lucide-react";

export async function WaitlistWrapper({ children }: PropsWithChildren) {
  // Static logo configuration
  const logo = {
    url: "/logo-dark.svg",
    alt: "OpenCourt Logo",
    width: 200,
    height: 60,
  };

  return (
    <div
      className={clsx(
        "w-full mx-auto max-w-[500px] flex flex-col justify-center items-center bg-black/40 backdrop-blur-xl border border-white/10 pb-0 overflow-hidden rounded-2xl",
        "shadow-[0px_20px_50px_0px_rgba(0,0,0,0.5)]",
      )}
    >
      <div className="flex flex-col items-center gap-4 flex-1 text-center w-full p-8 pb-4">
        <div>
          <div className="flex justify-center items-center gap-2 mx-auto">
            <div className="w-8 h-auto">
              <Image
                src={logo.url}
                alt={logo.alt}
                width={logo.width}
                height={logo.height}
                priority
                className="filter invert"
              />{" "}
            </div>
            <h1 className="text-2xl font-semibold text-white">OpenCourt</h1>
          </div>
        </div>
        <div className="flex flex-col gap-10">{children}</div>
      </div>
      <footer className="flex justify-between items-center w-full self-stretch px-8 py-3 text-sm bg-white/5 border-t border-white/10 overflow-hidden">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} OpenCourt. All rights reserved.
        </p>
        <a
          href="https://google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-white transition-colors"
        >
          <MessageCircle size={16} />
        </a>
      </footer>
    </div>
  );
}
