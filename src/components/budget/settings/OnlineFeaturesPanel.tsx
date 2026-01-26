'use client';

/**
 * Online Features Panel
 * Shows "Coming Soon" cards for features available in the online version
 */

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Cloud,
  CloudUpload,
  UserPlus,
  RefreshCw,
  Smartphone,
  Shield,
  Sparkles,
  ArrowRight,
  Lock,
} from 'lucide-react';
import {
  isOnlineMode,
  getDisabledFeatures,
  FEATURE_DESCRIPTIONS,
  type FeatureName,
} from '@/config/features';
import { cn } from '@/lib/utils';

const FEATURE_ICONS: Record<string, React.ReactNode> = {
  cloudSync: <Cloud className="h-8 w-8" />,
  familyInvites: <UserPlus className="h-8 w-8" />,
  cloudBackup: <CloudUpload className="h-8 w-8" />,
  realTimeCollab: <RefreshCw className="h-8 w-8" />,
};

const FEATURE_BENEFITS: Record<string, string[]> = {
  cloudSync: [
    'Access your data from any device',
    'Automatic sync across phones, tablets, and computers',
    'Never lose your data if you switch devices',
  ],
  familyInvites: [
    'Share budgets with family members',
    'Invite via email or link',
    'Manage permissions for each member',
  ],
  cloudBackup: [
    'Automatic daily backups',
    'Restore from any point in time',
    'Bank-level encryption for your data',
  ],
  realTimeCollab: [
    'See changes from family members instantly',
    'Collaborative budget planning',
    'Live activity feed',
  ],
};

interface FeatureCardProps {
  feature: FeatureName;
  icon: React.ReactNode;
  benefits: string[];
}

function FeatureCard({ feature, icon, benefits }: FeatureCardProps) {
  const info = FEATURE_DESCRIPTIONS[feature];

  return (
    <Card className="relative overflow-hidden">
      {/* Coming Soon Badge */}
      <Badge
        className="absolute top-4 right-4"
        variant="secondary"
      >
        <Sparkles className="h-3 w-3 mr-1" />
        Coming Soon
      </Badge>

      <CardHeader className="pb-2">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
          <div>
            <CardTitle className="text-lg">{info.title}</CardTitle>
            <CardDescription>{info.description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ul className="space-y-2">
          {benefits.map((benefit, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <ArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
              <span className="text-muted-foreground">{benefit}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function OnlineFeaturesPanel() {
  const disabledFeatures = getDisabledFeatures();

  // Filter to only show online-specific features
  const onlineFeatures = disabledFeatures.filter(
    (f) =>
      f === 'cloudSync' ||
      f === 'familyInvites' ||
      f === 'cloudBackup' ||
      f === 'realTimeCollab'
  );

  if (isOnlineMode()) {
    return null; // Don't show this panel in online mode
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary text-primary-foreground">
              <Cloud className="h-6 w-6" />
            </div>
            <div>
              <CardTitle>Upgrade to Online</CardTitle>
              <CardDescription>
                Get powerful cloud features for your family budget
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              <span>Multi-device sync</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span>Secure cloud backup</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <UserPlus className="h-4 w-4 text-muted-foreground" />
              <span>Family sharing</span>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-lg bg-background/50 border">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">
                  Your data stays private in standalone mode
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  All your budget data is stored locally on your device. No
                  account required, no data leaves your device.
                </p>
              </div>
            </div>
          </div>

          <Button className="w-full mt-4" disabled>
            <Sparkles className="h-4 w-4 mr-2" />
            Coming Soon - Join Waitlist
          </Button>
        </CardContent>
      </Card>

      {/* Feature Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {onlineFeatures.map((feature) => (
          <FeatureCard
            key={feature}
            feature={feature}
            icon={FEATURE_ICONS[feature] || <Cloud className="h-8 w-8" />}
            benefits={FEATURE_BENEFITS[feature] || []}
          />
        ))}
      </div>

      {/* Comparison Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Standalone vs Online</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            {/* Header Row */}
            <div className="font-medium">Feature</div>
            <div className="font-medium text-center">Standalone</div>
            <div className="font-medium text-center">Online</div>

            {/* Data Storage */}
            <div className="text-muted-foreground">Data Storage</div>
            <div className="text-center">Local device</div>
            <div className="text-center text-primary">Cloud + Local</div>

            {/* Multi-device */}
            <div className="text-muted-foreground">Multi-device</div>
            <div className="text-center">Manual export</div>
            <div className="text-center text-primary">Auto sync</div>

            {/* Backup */}
            <div className="text-muted-foreground">Backup</div>
            <div className="text-center">Manual</div>
            <div className="text-center text-primary">Automatic</div>

            {/* Family Sharing */}
            <div className="text-muted-foreground">Family Sharing</div>
            <div className="text-center">Same device</div>
            <div className="text-center text-primary">Any device</div>

            {/* Account Required */}
            <div className="text-muted-foreground">Account Required</div>
            <div className="text-center text-green-600">No</div>
            <div className="text-center">Yes</div>

            {/* Privacy */}
            <div className="text-muted-foreground">Privacy</div>
            <div className="text-center text-green-600">100% local</div>
            <div className="text-center">Encrypted cloud</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
