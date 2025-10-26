"use client";

import MicroQuiz from "@/components/study/MicroQuiz";

/**
 * MDX-friendly wrapper for MicroQuiz component
 *
 * Usage in MDX files:
 *
 * <MicroQuizMDX
 *   question="What is the primary purpose of Tanium sensors?"
 *   options={[
 *     "To monitor network traffic",
 *     "To collect real-time endpoint data",
 *     "To deploy software updates",
 *     "To scan for vulnerabilities"
 *   ]}
 *   correctAnswer="To collect real-time endpoint data"
 *   explanation="Sensors in Tanium are used to query and collect specific pieces of information from endpoints in real-time."
 *   concept="Sensors"
 * />
 */

interface MicroQuizMDXProps {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  concept?: string;
}

export default function MicroQuizMDX(props: MicroQuizMDXProps) {
  return <MicroQuiz {...props} />;
}
