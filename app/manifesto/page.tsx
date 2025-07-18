import { WaitlistWrapper } from "@/components/box";
import { RichText } from "@/components/rich-text";
import { Alex_Brush } from "next/font/google";
import clsx from "clsx";
import { Metadata } from "next";
import { manifestoConfig, siteConfig } from "@/lib/content";

const font = Alex_Brush({
  variable: "--font-alex-brush",
  subsets: ["latin"],
  weight: "400",
});

export const dynamic = "force-static";
export const revalidate = 30;

export const metadata: Metadata = {
  title: manifestoConfig.title,
  description: siteConfig.metadata.defaultDescription,
  openGraph: {
    type: "website",
    images: [siteConfig.metadata.ogImage.url],
  },
  twitter: {
    card: "summary_large_image",
    images: [siteConfig.metadata.ogImage.url],
  },
  icons: [siteConfig.metadata.favicon.url],
};

export default async function Manifesto() {
  return (
    <WaitlistWrapper>
      <div className="flex flex-col gap-10">
        <div className="text-slate-11 [&>p]:tracking-tight [&>p]:leading-[1.6] [&>p:not(:last-child)]:mb-3 [&>h2]:text-slate-12 [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:mb-4 [&>h3]:text-slate-12 [&>h3]:text-lg [&>h3]:font-medium [&>h3]:mb-3 [&>ul]:ml-4 [&>ul]:space-y-2 [&>li]:list-disc text-pretty text-start">
          <RichText content={manifestoConfig.content} />
        </div>
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-0.5 items-start">
            <p
              className={clsx(
                "text-slate-12 text-4xl font-medium italic transform -rotate-12",
                font.className
              )}
            >
              OpenCourt Team
            </p>
            <p className="text-slate-11 text-sm font-medium">
              The OpenCourt Team{" "}
              <span className="text-slate-10 text-xs">
                Founders & Builders
              </span>
            </p>
          </div>
        </div>
      </div>
    </WaitlistWrapper>
  );
}
