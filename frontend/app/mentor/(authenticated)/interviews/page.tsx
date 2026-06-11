"use client";

import { Suspense } from "react";
import PathMentorInterviews from "@/components/PathMentorInterviews";

export default function MentorInterviewsPage() {
  return (
    <Suspense fallback={null}>
      <PathMentorInterviews />
    </Suspense>
  );
}
