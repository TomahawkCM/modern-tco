"use client";

import dynamic from "next/dynamic";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Sparkles } from "@/components/ui/sparkles";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { FloatingNav } from "@/components/ui/floating-navbar";
import { HeroParallax } from "@/components/ui/hero-parallax";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { Meteors } from "@/components/ui/meteors";

const AnimatedTestimonials = dynamic(
  () => import("@/components/ui/animated-testimonials").then((m) => m.AnimatedTestimonials),
  { ssr: false, loading: () => <div className="h-24" /> }
);

const InfiniteMovingCards = dynamic(
  () => import("@/components/ui/infinite-moving-cards").then((m) => m.InfiniteMovingCards),
  { ssr: false, loading: () => <div className="h-24" /> }
);

// Example showcase component to demonstrate Aceternity UI components
export default function AceternityShowcase() {
  const words = `Transform your Tanium TCO study experience with cutting-edge animations and modern UI components.`;

  const testimonials = [
    {
      quote:
        "The interactive components make studying for TCO certification engaging and memorable.",
      name: "Sarah Johnson",
      designation: "IT Security Analyst",
      src: "/avatar1.jpg",
    },
    {
      quote: "Beautiful animations help visualize complex Tanium concepts effectively.",
      name: "Michael Chen",
      designation: "Systems Administrator",
      src: "/avatar2.jpg",
    },
    {
      quote: "The modern UI design keeps me focused and motivated during study sessions.",
      name: "Emily Rodriguez",
      designation: "Infrastructure Engineer",
      src: "/avatar3.jpg",
    },
  ];

  const movingCards = [
    {
      quote: "Master Tanium Console Operations",
      name: "TCO Domain 1",
      title: "Asking Questions - 22%",
    },
    {
      quote: "Advanced Targeting & Refinement",
      name: "TCO Domain 2",
      title: "Refining Questions - 23%",
    },
    {
      quote: "Safe Package Deployment",
      name: "TCO Domain 3",
      title: "Taking Action - 15%",
    },
    {
      quote: "Platform Navigation Mastery",
      name: "TCO Domain 4",
      title: "Navigation & Modules - 23%",
    },
    {
      quote: "Data Export & Reporting",
      name: "TCO Domain 5",
      title: "Reporting & Data - 17%",
    },
  ];

  return (
    <div className="relative min-h-screen bg-black">
      <BackgroundBeams />

      {/* Hero Section with Text Generate Effect */}
      <section className="relative z-10 pb-16 pt-20">
        <div className="container mx-auto px-4 text-center">
          <div>
            <h1 className="mb-8 text-4xl font-bold text-white md:text-6xl">
              Tanium TCO Study Platform
            </h1>
          </div>
          <TextGenerateEffect
            words={words}
            className="mx-auto max-w-3xl text-lg text-gray-300 md:text-xl"
          />
        </div>
      </section>

      {/* 3D Card Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-white">
            Interactive Study Cards
          </h2>
          <CardContainer className="inter-var mx-auto max-w-md">
            <CardBody className="group/card relative h-auto w-auto rounded-xl border border-black/[0.1] bg-gray-50 p-6 dark:border-white/[0.2] dark:bg-black dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] sm:w-[350px]">
              <CardItem
                translateZ="50"
                className="text-xl font-bold text-neutral-600 dark:text-white"
              >
                TCO Certification
              </CardItem>
              <CardItem
                as="p"
                translateZ="60"
                className="mt-2 max-w-sm text-sm text-neutral-500 dark:text-neutral-300"
              >
                Master the Tanium platform with interactive labs and comprehensive study materials.
              </CardItem>
              <CardItem translateZ="100" className="mt-4 w-full">
                <div className="flex h-60 w-full items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600">
                  <div className="text-center text-white">
                    <div className="mb-2 text-3xl font-bold">95%+</div>
                    <div className="text-lg">Pass Rate</div>
                  </div>
                </div>
              </CardItem>
              <div className="mt-20 flex items-center justify-between">
                <CardItem
                  translateZ={20}
                  className="rounded-xl px-4 py-2 text-xs font-normal dark:text-white"
                >
                  Start Learning →
                </CardItem>
                <CardItem
                  translateZ={20}
                  className="rounded-xl bg-black px-4 py-2 text-xs font-bold text-white dark:bg-white dark:text-black"
                >
                  Begin Study
                </CardItem>
              </div>
            </CardBody>
          </CardContainer>
        </div>
      </section>

      {/* Meteors Effect Section */}
      <section className="relative py-16">
        <div className="container mx-auto px-4">
          <div className="relative mx-auto max-w-md">
            <div className="absolute inset-0 h-full w-full scale-[0.80] transform rounded-full bg-red-500 bg-gradient-to-r from-blue-500 to-teal-500 blur-3xl" />
            <div className="relative flex h-full flex-col items-start justify-end overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 px-4 py-8 shadow-xl">
              <div className="mb-4 flex h-5 w-5 items-center justify-center rounded-full border border-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="h-2 w-2 text-gray-300"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25"
                  />
                </svg>
              </div>
              <h1 className="relative z-50 mb-4 text-xl font-bold text-white">
                Advanced Study Features
              </h1>
              <p className="relative z-50 mb-4 text-base font-normal text-slate-500">
                Experience interactive labs, real-time progress tracking, and adaptive learning
                powered by modern animations.
              </p>
              <button className="rounded-lg border border-gray-500 px-4 py-1 text-gray-300">
                Explore Features
              </button>
              <Meteors number={20} />
            </div>
          </div>
        </div>
      </section>

      {/* Infinite Moving Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-white">TCO Study Domains</h2>
          <InfiniteMovingCards items={movingCards} direction="right" speed="slow" />
        </div>
      </section>

      {/* Animated Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-white">
            Student Success Stories
          </h2>
          <AnimatedTestimonials testimonials={testimonials} />
        </div>
      </section>
    </div>
  );
}
