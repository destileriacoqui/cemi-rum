/* =============================================================================
 * lib/alcoholCompliance.ts
 *
 * Typed wrapper around the single runtime source of truth in
 * ../js/alcohol-compliance.js so the serverless/API layer (checkout, pickup,
 * tour, email, admin) reads the SAME config flags, copy, and decision
 * functions the front-end uses. Do not duplicate values here — edit the .js.
 *
 * NOTHING HERE IS LEGAL ADVICE. All flags are owner-configurable defaults that
 * require confirmation from Hacienda, an attorney, the payment processor, and
 * any carrier/delivery provider before being relied upon. Online checkout is
 * ENABLED with a mandatory age + government-ID confirmation at checkout (owner
 * instruction); alcohol SHIPPING and DELIVERY remain DISABLED by default.
 * Enabling online alcohol sale still requires the reviews named above.
 * ========================================================================== */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const compliance = require('../js/alcohol-compliance.js');

export interface AlcoholConfig {
  LEGAL_DRINKING_AGE: number;
  STRICT_ALCOHOL_MODE: boolean;
  STRICT_ALCOHOL_AGE: number;
  ALLOW_ALCOHOL_ONLINE_CHECKOUT: boolean;
  ALLOW_ALCOHOL_SHIPPING: boolean;
  ALLOW_ALCOHOL_DELIVERY: boolean;
  ALLOW_PICKUP_REQUESTS: boolean;
  REQUIRE_ID_AT_PICKUP: boolean;
  REQUIRE_ID_FOR_SHIPPING: boolean;
  REQUIRE_ID_FOR_TASTINGS: boolean;
  REQUIRE_PREGNANCY_WARNING: boolean;
  REQUIRE_RESPONSIBLE_DRINKING_NOTICE: boolean;
  SHOW_ALCOHOL_POLICY_LINKS: boolean;
}

export type DateOfBirth = Date | string | { year: number | string; month: number | string; day: number | string };

export const config: AlcoholConfig = compliance.config;
export const copy: Record<string, string> = compliance.copy;
export const getConfig = (): AlcoholConfig => compliance.getConfig();
export const configure = (overrides: Partial<AlcoholConfig>): AlcoholConfig => compliance.configure(overrides);

export const calculateAge = (dob: DateOfBirth, now?: Date): number | null => compliance.calculateAge(dob, now);
export const getRequiredAlcoholAge = (): number => compliance.getRequiredAlcoholAge();
export const isOfLegalDrinkingAge = (dob: DateOfBirth, now?: Date): boolean => compliance.isOfLegalDrinkingAge(dob, now);

/* Server-side gating helpers. These mirror the front-end flags so an API route
 * can refuse an action the UI should never have allowed (defense in depth). */
export const canCheckoutAlcohol = (): boolean => config.ALLOW_ALCOHOL_ONLINE_CHECKOUT;
export const canShipAlcohol = (): boolean => config.ALLOW_ALCOHOL_SHIPPING || config.ALLOW_ALCOHOL_DELIVERY;
export const canRequestAlcoholPickup = (): boolean => config.ALLOW_PICKUP_REQUESTS;

export default compliance;
