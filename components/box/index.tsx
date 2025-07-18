import clsx from "clsx";
import { PropsWithChildren } from "react";
import Image from "next/image";

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
        "w-full mx-auto max-w-[500px] flex flex-col justify-center items-center bg-zinc-900 pb-0 overflow-hidden rounded-2xl border border-zinc-700",
        "shadow-[0px_20px_50px_0px_rgba(0,0,0,0.5)] shadow-inner",
        "bg-gradient-to-b from-zinc-900 to-zinc-950",
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
      <footer className="flex justify-between items-center w-full self-stretch px-8 py-3 text-sm bg-zinc-800/50 border-t border-zinc-700 overflow-hidden">
        <p className="text-xs text-zinc-500">
          © {new Date().getFullYear()} OpenCourt. All rights reserved.
        </p>
        <a
          href="https://github.com/themattmayfield/opencourt"
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
        </a>
      </footer>
    </div>
  );
}
