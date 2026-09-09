/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { authService } from "./services/authService";
import { profileService } from "./services/profileService";
import { matchService } from "./services/matchService";
import { messageService } from "./services/messageService";
import { privacyService } from "./services/privacyService";
import { adminService } from "./services/adminService";
import { paymentService } from "./services/paymentService";
import { diagnosticsService } from "./services/diagnosticsService";
import {
  supabase,
  supabaseUrl,
  isDesignatedAdminEmail,
  cleanUrl,
  isValidSupabaseUrl,
  isValidUuid,
  setConnectionError,
  handleConnectionError,
  isDemoMode,
} from "./services/supabaseClient";
import { initializeDemoDB } from "./services/storage";

// Ensure initial demo storage is initialized on load
initializeDemoDB();

// Unified facade for backwards-compatibility and simple consumption
export const supabaseService = {
  auth: authService,
  profiles: profileService,
  swipes: matchService,
  messages: messageService,
  privacy: privacyService,
  admin: adminService,
  payments: paymentService,
  checkSupabaseHealth: diagnosticsService.checkSupabaseHealth,
};

// Re-export core clients and helper utilities
export {
  supabase,
  supabaseUrl,
  isDesignatedAdminEmail,
  cleanUrl,
  isValidSupabaseUrl,
  isValidUuid,
  setConnectionError,
  handleConnectionError,
  isDemoMode,
  authService,
  profileService,
  matchService,
  messageService,
  privacyService,
  adminService,
  paymentService,
  diagnosticsService,
};
