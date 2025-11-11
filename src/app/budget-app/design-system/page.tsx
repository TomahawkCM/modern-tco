'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function DesignSystemPlayground() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'high-contrast'>('light');
  const [reduceMotion, setReduceMotion] = useState(false);
  const [fontSize, setFontSize] = useState(18);

  // Apply theme to document
  const applyTheme = (newTheme: typeof theme) => {
    setTheme(newTheme);
    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'high-contrast');
    root.classList.add(newTheme);
  };

  // Apply reduced motion
  const toggleReduceMotion = (enabled: boolean) => {
    setReduceMotion(enabled);
    const root = document.documentElement;
    if (enabled) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  };

  // Apply font size
  const applyFontSize = (size: number) => {
    setFontSize(size);
    document.documentElement.style.setProperty('--base-font-size', `${size}px`);
  };

  return (
    <div className="min-h-screen bg-background p-page-x py-page-y">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-section">
          <h1 className="mb-4 text-4xl font-bold text-foreground">
            Design System Playground
          </h1>
          <p className="text-lg text-muted-foreground">
            Interactive showcase of all components, design tokens, and accessibility features
          </p>
        </header>

        {/* Controls Panel */}
        <Card className="mb-section p-card">
          <h2 className="mb-4 text-2xl font-semibold">Accessibility Controls</h2>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Theme Selector */}
            <div className="space-y-2">
              <Label>Theme Mode</Label>
              <Select value={theme} onValueChange={(v) => applyTheme(v as typeof theme)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="high-contrast">High Contrast</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Font Size Slider */}
            <div className="space-y-2">
              <Label>Base Font Size: {fontSize}px</Label>
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
              <Label htmlFor="reduce-motion">Reduce Motion</Label>
            </div>
          </div>
        </Card>

        {/* Design Tokens */}
        <section className="mb-section">
          <h2 className="mb-subsection text-3xl font-bold">Design Tokens</h2>

          {/* Colors */}
          <Card className="mb-card-gap p-card">
            <h3 className="mb-4 text-xl font-semibold">Colors</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6">
              {[
                { name: 'Primary', var: '--primary' },
                { name: 'Secondary', var: '--secondary' },
                { name: 'Accent', var: '--accent' },
                { name: 'Destructive', var: '--destructive' },
                { name: 'Muted', var: '--muted' },
                { name: 'Border', var: '--border' },
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
            <h3 className="mb-4 text-xl font-semibold">Spacing Tokens</h3>
            <div className="space-y-3">
              {[
                { name: 'Touch Target (54px)', size: 'touch' },
                { name: 'Section (54px)', size: 'section' },
                { name: 'Subsection (36px)', size: 'subsection' },
                { name: 'Card Padding (27px)', size: 'card' },
                { name: 'Card Gap (18px)', size: 'card-gap' },
                { name: 'Page X (18-36px)', size: 'page-x' },
                { name: 'Page Y (27-45px)', size: 'page-y' },
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
            <h3 className="mb-4 text-xl font-semibold">Shadow Tokens</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {['xs', 'sm', 'md', 'lg', 'xl', '2xl', 'focus'].map((shadow) => (
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
            <h3 className="mb-4 text-xl font-semibold">Motion Tokens</h3>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium">Duration Scale</p>
                <div className="flex gap-2">
                  {['instant', 'fast', 'normal', 'slow', 'slower'].map((duration) => (
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
                <p className="mb-2 text-sm font-medium">Easing Curves</p>
                <div className="flex gap-2">
                  {['default', 'emphasized', 'decelerate', 'bounce'].map((easing) => (
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
          <h2 className="mb-subsection text-3xl font-bold">Component States</h2>

          {/* Buttons */}
          <Card className="mb-card-gap p-card">
            <h3 className="mb-4 text-xl font-semibold">Buttons</h3>
            <div className="space-y-4">
              {/* Variants */}
              <div>
                <p className="mb-2 text-sm font-medium">Variants</p>
                <div className="flex flex-wrap gap-2">
                  <Button>Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <p className="mb-2 text-sm font-medium">Sizes</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                </div>
              </div>

              {/* States */}
              <div>
                <p className="mb-2 text-sm font-medium">States</p>
                <div className="flex flex-wrap gap-2">
                  <Button>Default</Button>
                  <Button className="hover:bg-primary-foreground">Hover</Button>
                  <Button className="ring-2 ring-ring ring-offset-2">Focus</Button>
                  <Button disabled>Disabled</Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Inputs */}
          <Card className="mb-card-gap p-card">
            <h3 className="mb-4 text-xl font-semibold">Inputs</h3>
            <div className="space-y-4 max-w-md">
              <div>
                <Label>Default Input</Label>
                <Input placeholder="Enter text..." />
              </div>
              <div>
                <Label>Disabled Input</Label>
                <Input placeholder="Disabled..." disabled />
              </div>
              <div>
                <Label>Error Input</Label>
                <Input
                  placeholder="Invalid..."
                  className="border-destructive focus-visible:ring-destructive"
                />
                <p className="mt-1 text-sm text-destructive">Error message</p>
              </div>
            </div>
          </Card>

          {/* Form Controls */}
          <Card className="mb-card-gap p-card">
            <h3 className="mb-4 text-xl font-semibold">Form Controls</h3>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Checkboxes */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Checkboxes</p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="check1" />
                    <Label htmlFor="check1">Unchecked</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="check2" defaultChecked />
                    <Label htmlFor="check2">Checked</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="check3" disabled />
                    <Label htmlFor="check3">Disabled</Label>
                  </div>
                </div>
              </div>

              {/* Radio Buttons */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Radio Buttons</p>
                <RadioGroup defaultValue="option1">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option1" id="radio1" />
                    <Label htmlFor="radio1">Option 1</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option2" id="radio2" />
                    <Label htmlFor="radio2">Option 2</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option3" id="radio3" disabled />
                    <Label htmlFor="radio3">Disabled</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Switches */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Switches</p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="switch1" />
                    <Label htmlFor="switch1">Off</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="switch2" defaultChecked />
                    <Label htmlFor="switch2">On</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="switch3" disabled />
                    <Label htmlFor="switch3">Disabled</Label>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Cards */}
          <Card className="p-card">
            <h3 className="mb-4 text-xl font-semibold">Cards</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="p-4">
                <h4 className="mb-2 font-semibold">Default Card</h4>
                <p className="text-sm text-muted-foreground">
                  Basic card with default styles
                </p>
              </Card>
              <Card className="p-4 shadow-lg">
                <h4 className="mb-2 font-semibold">Elevated Card</h4>
                <p className="text-sm text-muted-foreground">
                  Card with shadow-lg elevation
                </p>
              </Card>
              <Card className="p-4 border-2 border-primary">
                <h4 className="mb-2 font-semibold">Highlighted Card</h4>
                <p className="text-sm text-muted-foreground">
                  Card with primary border
                </p>
              </Card>
            </div>
          </Card>
        </section>

        {/* Typography */}
        <section className="mb-section">
          <h2 className="mb-subsection text-3xl font-bold">Typography</h2>
          <Card className="p-card">
            <div className="space-y-4">
              <div>
                <h1 className="text-4xl font-bold">Heading 1 (48px)</h1>
              </div>
              <div>
                <h2 className="text-3xl font-bold">Heading 2 (36px)</h2>
              </div>
              <div>
                <h3 className="text-2xl font-semibold">Heading 3 (30px)</h3>
              </div>
              <div>
                <h4 className="text-xl font-semibold">Heading 4 (24px)</h4>
              </div>
              <div>
                <h5 className="text-lg font-medium">Heading 5 (20px)</h5>
              </div>
              <div>
                <p className="text-base">
                  Body text (18px base) - Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Designed for optimal readability with WCAG 2.2 AA compliance.
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Small text (16px) - Secondary information and captions
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Extra small text (14px) - Footnotes and legal text
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Accessibility Info */}
        <section>
          <Card className="p-card bg-muted">
            <h2 className="mb-4 text-2xl font-bold">Accessibility Guidelines</h2>
            <ul className="space-y-2 text-sm">
              <li>✅ <strong>WCAG 2.2 AA Compliant:</strong> Contrast ratios ≥4.5:1 for normal text, ≥3:1 for large text</li>
              <li>✅ <strong>Touch Targets:</strong> Minimum 48×48px (54px with spacing) for all interactive elements</li>
              <li>✅ <strong>Base Font Size:</strong> 18px for improved readability (seniors-friendly)</li>
              <li>✅ <strong>Reduced Motion:</strong> Automatic detection + manual toggle for vestibular disorders</li>
              <li>✅ <strong>Focus Indicators:</strong> 3px ring with 50% opacity on all interactive elements</li>
              <li>✅ <strong>Semantic HTML:</strong> Proper heading hierarchy and landmark regions</li>
              <li>✅ <strong>Keyboard Navigation:</strong> All functionality accessible via keyboard</li>
              <li>✅ <strong>High Contrast Mode:</strong> Removes shadows, increases border thickness</li>
            </ul>
          </Card>
        </section>
      </div>
    </div>
  );
}
