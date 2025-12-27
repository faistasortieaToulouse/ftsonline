"use client";

import dynamic from "next/dynamic";

const CruesMap = dynamic(() => import("./CruesMap"), { ssr: false });

export default function CruesMapWrapper() {
  return <CruesMap />;
}
