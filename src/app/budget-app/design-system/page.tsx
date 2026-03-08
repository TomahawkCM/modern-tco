"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DesignSystemPlayground() {
  const t = useTranslations("designSystem");
  const [theme, setTheme] = useState<"light" | "dark" | "high-contrast">("light");
  const [reduceMotion, setReduceMotion] = useState(false);
  const [fontSize, setFontSize] = useState(18);

  // Apply theme to document
  const applyTheme = (newTheme: typeof theme) => {
    setTheme(newTheme);
    const root = document.documentElement;
    root.classList.remove("light", "dark", "high-contrast");
    root.classList.add(newTheme);
  };

  // Apply reduced motion
  const toggleReduceMotion = (enabled: boolean) => {
    setReduceMotion(enabled);
    const root = document.documentElement;
    if (enabled) {
      root.classList.add("reduce-motion");
    } else {
      root.classList.remove("reduce-motion");
    }
  };

  // Apply font size
  const applyFontSize = (size: number) => {
    setFontSize(size);
    document.documentElement.style.setProperty("--base-font-size", `${size}px`);
  };

  return (
    <div className="min-h-screen bg-background p-page-x py-page-y">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-section">
          <h1 className="mb-4 text-4xl font-bold text-foreground">{t("title")}</h1>
          <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
        </header>

        {/* Controls Panel */}
        <Card className="mb-section p-card">
          <h2 className="mb-4 text-2xl font-semibold">{t("accessibilityControls")}</h2>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Theme Selector */}
            <div className="space-y-2">
              <Label>{t("themeMode")}</Label>
              <Select value={theme} onValueChange={(v) => applyTheme(v as typeof theme)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">{t("light")}</SelectItem>
                  <SelectItem value="dark">{t("dark")}</SelectItem>
                  <SelectItem value="high-contrast">{t("highContrast")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Font Size Slider */}
            <div className="space-y-2">
              <Label>{t("baseFontSize", { size: fontSize })}</Label>
              <input
                type="range"
                min="14"
                max="24"
                value={fontSize}
                onChange={(e) => applyFontSize(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Reduced Motion Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                id="reduce-motion"
                checked={reduceMotion}
                onCheckedChange={toggleReduceMotion}
              />
              <Label htmlFor="reduce-motion">{t("reduceMotion")}</Label>
            </div>
          </div>
        </Card>

        {/* Design Tokens */}
        <section className="mb-section">
          <h2 className="mb-subsection text-3xl font-bold">{t("designTokens")}</h2>

          {/* Colors */}
          <Card className="mb-card-gap p-card">
            <h3 className="mb-4 text-xl font-semibold">{t("colors")}</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6">
              {[
                { name: "Primary", var: "--primary" },
                { name: "Secondary", var: "--secondary" },
                { name: "Accent", var: "--accent" },
                { name: "Destructive", var: "--destructive" },
                { name: "Muted", var: "--muted" },
                { name: "Border", var: "--border" },
              ].map((color) => (
                <div key={color.name} className="space-y-2">
                  <div
                    className="h-16 w-full rounded-md border-2"
                    style={{ backgroundColor: `hsl(var(${color.var}))` }}
                  />
                  <p className="text-sm font-medium">{color.name}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Spacing */}
          <Card className="mb-card-gap p-card">
            <h3 className="mb-4 text-xl font-semibold">{t("spacingTokens")}</h3>
            <div className="space-y-3">
              {[
                { name: "Touch Target (54px)", size: "touch" },
                { name: "Section (54px)", size: "section" },
                { name: "Subsection (36px)", size: "subsection" },
                { name: "Card Padding (27px)", size: "card" },
                { name: "Card Gap (18px)", size: "card-gap" },
                { name: "Page X (18-36px)", size: "page-x" },
                { name: "Page Y (27-45px)", size: "page-y" },
              ].map((spacing) => (
                <div key={spacing.name} className="flex items-center gap-4">
                  <div
                    className={`h-8 bg-primary`}
                    style={{ width: `var(--spacing-${spacing.size})` }}
                  />
                  <span className="text-sm">{spacing.name}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Shadows */}
          <Card className="mb-card-gap p-card">
            <h3 className="mb-4 text-xl font-semibold">{t("shadowTokens")}</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {["xs", "sm", "md", "lg", "xl", "2xl", "focus"].map((shadow) => (
                <div
                  key={shadow}
                  className={`h-20 rounded-md bg-card shadow-${shadow} flex items-center justify-center`}
                >
                  <span className="text-sm font-medium">shadow-{shadow}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Motion */}
          <Card className="p-card">
            <h3 className="mb-4 text-xl font-semibold">{t("motionTokens")}</h3>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium">{t("durationScale")}</p>
                <div className="flex gap-2">
                  {["instant", "fast", "normal", "slow", "slower"].map((duration) => (
                    <Button
                      key={duration}
                      variant="outline"
                      className="transition-all"
                      style={{ transitionDuration: `var(--duration-${duration})` }}
                    >
                      {duration}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">{t("easingCurves")}</p>
                <div className="flex gap-2">
                  {["default", "emphasized", "decelerate", "bounce"].map((easing) => (
                    <div
                      key={easing}
                      className="h-12 w-12 rounded bg-primary transition-transform duration-normal hover:scale-110"
                      style={{ transitionTimingFunction: `var(--easing-${easing})` }}
                      title={easing}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Component States */}
        <section className="mb-section">
          <h2 className="mb-subsection text-3xl font-bold">{t("componentStates")}</h2>

          {/* Buttons */}
          <Card className="mb-card-gap p-card">
            <h3 className="mb-4 text-xl font-semibold">{t("buttons")}</h3>
            <div className="space-y-4">
              {/* Variants */}
              <div>
                <p className="mb-2 text-sm font-medium">{t("variants")}</p>
                <div className="flex flex-wrap gap-2">
                  <Button>{t("primary")}</Button>
                  <Button variant="secondary">{t("secondary")}</Button>
                  <Button variant="outline">{t("outline")}</Button>
                  <Button variant="ghost">{t("ghost")}</Button>
                  <Button variant="destructive">{t("destructive")}</Button>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <p className="mb-2 text-sm font-medium">{t("sizes")}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm">{t("small")}</Button>
                  <Button size="default">{t("default")}</Button>
                  <Button size="lg">{t("large")}</Button>
                </div>
              </div>

              {/* States */}
              <div>
                <p className="mb-2 text-sm font-medium">{t("states")}</p>
                <div className="flex flex-wrap gap-2">
                  <Button>{t("default")}</Button>
                  <Button className="hover:bg-primary-foreground">{t("hover")}</Button>
                  <Button className="ring-2 ring-ring ring-offset-2">{t("focus")}</Button>
                  <Button disabled>{t("disabled")}</Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Inputs */}
          <Card className="mb-card-gap p-card">
            <h3 className="mb-4 text-xl font-semibold">{t("inputs")}</h3>
            <div className="max-w-md space-y-4">
              <div>
                <Label>{t("defaultInput")}</Label>
                <Input placeholder={t("enterText")} />
              </div>
              <div>
                <Label>{t("disabledInput")}</Label>
                <Input placeholder={t("disabledPlaceholder")} disabled />
              </div>
              <div>
                <Label>{t("errorInput")}</Label>
                <Input
                  placeholder={t("invalidPlaceholder")}
                  className="border-destructive focus-visible:ring-destructive"
                />
                <p className="mt-1 text-sm text-destructive">{t("errorMessage")}</p>
              </div>
            </div>
          </Card>

          {/* Form Controls */}
          <Card className="mb-card-gap p-card">
            <h3 className="mb-4 text-xl font-semibold">{t("formControls")}</h3>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Checkboxes */}
              <div className="space-y-2">
                <p className="text-sm font-medium">{t("checkboxes")}</p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="check1" />
                    <Label htmlFor="check1">{t("unchecked")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="check2" defaultChecked />
                    <Label htmlFor="check2">{t("checked")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="check3" disabled />
                    <Label htmlFor="check3">{t("disabled")}</Label>
                  </div>
                </div>
              </div>

              {/* Radio Buttons */}
              <div className="space-y-2">
                <p className="text-sm font-medium">{t("radioButtons")}</p>
                <RadioGroup defaultValue="option1">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option1" id="radio1" />
                    <Label htmlFor="radio1">{t("option1")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option2" id="radio2" />
                    <Label htmlFor="radio2">{t("option2")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option3" id="radio3" disabled />
                    <Label htmlFor="radio3">{t("disabled")}</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Switches */}
              <div className="space-y-2">
                <p className="text-sm font-medium">{t("switches")}</p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="switch1" />
                    <Label htmlFor="switch1">{t("off")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="switch2" defaultChecked />
                    <Label htmlFor="switch2">{t("on")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="switch3" disabled />
                    <Label htmlFor="switch3">{t("disabled")}</Label>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Cards */}
          <Card className="p-card">
            <h3 className="mb-4 text-xl font-semibold">{t("cards")}</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="p-4">
                <h4 className="mb-2 font-semibold">{t("defaultCard")}</h4>
                <p className="text-sm text-muted-foreground">{t("defaultCardDescription")}</p>
              </Card>
              <Card className="p-4 shadow-lg">
                <h4 className="mb-2 font-semibold">{t("elevatedCard")}</h4>
                <p className="text-sm text-muted-foreground">{t("elevatedCardDescription")}</p>
              </Card>
              <Card className="border-2 border-primary p-4">
                <h4 className="mb-2 font-semibold">{t("highlightedCard")}</h4>
                <p className="text-sm text-muted-foreground">{t("highlightedCardDescription")}</p>
              </Card>
            </div>
          </Card>
        </section>

        {/* Typography */}
        <section className="mb-section">
          <h2 className="mb-subsection text-3xl font-bold">{t("typography")}</h2>
          <Card className="p-card">
            <div className="space-y-4">
              <div>
                <h1 className="text-4xl font-bold">{t("heading1")}</h1>
              </div>
              <div>
                <h2 className="text-3xl font-bold">{t("heading2")}</h2>
              </div>
              <div>
                <h3 className="text-2xl font-semibold">{t("heading3")}</h3>
              </div>
              <div>
                <h4 className="text-xl font-semibold">{t("heading4")}</h4>
              </div>
              <div>
                <h5 className="text-lg font-medium">{t("heading5")}</h5>
              </div>
              <div>
                <p className="text-base">{t("bodyText")}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("smallText")}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("extraSmallText")}</p>
              </div>
            </div>
          </Card>
        </section>

        {/* Accessibility Info */}
        <section>
          <Card className="bg-muted p-card">
            <h2 className="mb-4 text-2xl font-bold">{t("accessibilityGuidelines")}</h2>
            <ul className="space-y-2 text-sm">
              <li>{t("a11y.wcag")}</li>
              <li>{t("a11y.touchTargets")}</li>
              <li>{t("a11y.fontSize")}</li>
              <li>{t("a11y.reducedMotion")}</li>
              <li>{t("a11y.focusIndicators")}</li>
              <li>{t("a11y.semanticHtml")}</li>
              <li>{t("a11y.keyboardNav")}</li>
              <li>{t("a11y.highContrast")}</li>
            </ul>
          </Card>
        </section>
      </div>
    </div>
  );
}
