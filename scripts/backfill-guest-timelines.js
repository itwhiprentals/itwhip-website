"use strict";
// scripts/backfill-guest-timelines.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * ============================================================================
 * GUEST TIMELINE BACKFILL MIGRATION SCRIPT (APPEND MODE)
 * ============================================================================
 *
 * Purpose: Adds booking/trip/review activity to existing GuestProfileStatus timelines
 *
 * What It Does:
 * - Finds all ReviewerProfile records
 * - Extracts booking/trip/review events from database
 * - MERGES with existing moderation history
 * - Re-sorts everything chronologically
 * - Updates GuestProfileStatus.statusHistory
 *
 * Events Added:
 * 1. ACCOUNT_CREATED (from ReviewerProfile.memberSince)
 * 2. BOOKING_CREATED (from RentalBooking.createdAt)
 * 3. DOCUMENT_UPLOADED (if documents exist)
 * 4. DOCUMENT_VERIFIED (from ReviewerProfile.documentVerifiedAt)
 * 5. TRIP_STARTED (from RentalBooking.tripStartedAt)
 * 6. TRIP_ENDED (from RentalBooking.tripEndedAt)
 * 7. REVIEW_SUBMITTED (from RentalReview.createdAt)
 *
 * Usage:
 *   # Dry run (preview only)
 *   node scripts/backfill-guest-timelines.js --dry-run
 *
 *   # Actual execution
 *   node scripts/backfill-guest-timelines.js
 *
 * Safe Features:
 * - Preserves existing moderation history
 * - Merges and sorts all events
 * - Error handling (continues on failure)
 * - Progress tracking
 * ============================================================================
 */
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
// Check if dry-run mode
var DRY_RUN = process.argv.includes('--dry-run');
function backfillGuestTimelines() {
    return __awaiter(this, void 0, void 0, function () {
        var stats, guests, _i, guests_1, guest, existingStatus, existingHistory, newEvents, hasAccountCreated, bookings, _a, bookings_1, booking, carName, uploadTime, documentsUploaded, milesDriven, tripCharge, totalCharges, chargeDescription, reviews, _b, reviews_1, review, carName, stars, mergedHistory, percentage, error_1, errorMessage, error_2;
        var _c, _d, _e, _f, _g, _h, _j;
        return __generator(this, function (_k) {
            switch (_k.label) {
                case 0:
                    console.log('\n🚀 Guest Timeline Backfill Migration (APPEND MODE)');
                    console.log('='.repeat(60));
                    if (DRY_RUN) {
                        console.log('🔍 DRY RUN MODE - No data will be written');
                    }
                    else {
                        console.log('⚠️  LIVE MODE - Data will be written to database');
                    }
                    console.log('='.repeat(60));
                    console.log('');
                    stats = {
                        totalGuests: 0,
                        processed: 0,
                        success: 0,
                        skipped: 0,
                        errors: 0,
                        totalEventsAdded: 0,
                        errorDetails: []
                    };
                    _k.label = 1;
                case 1:
                    _k.trys.push([1, 12, 13, 15]);
                    // ========================================================================
                    // STEP 1: Fetch All ReviewerProfiles
                    // ========================================================================
                    console.log('📊 Step 1: Fetching all guest profiles...');
                    return [4 /*yield*/, prisma.reviewerProfile.findMany({
                            include: {
                                user: true,
                                profileStatus: true // Get existing status
                            },
                            orderBy: {
                                memberSince: 'asc'
                            }
                        })];
                case 2:
                    guests = _k.sent();
                    stats.totalGuests = guests.length;
                    console.log("\u2705 Found ".concat(stats.totalGuests, " guest profiles\n"));
                    // ========================================================================
                    // STEP 2: Process Each Guest
                    // ========================================================================
                    console.log('🔄 Step 2: Processing guest timelines...\n');
                    _i = 0, guests_1 = guests;
                    _k.label = 3;
                case 3:
                    if (!(_i < guests_1.length)) return [3 /*break*/, 11];
                    guest = guests_1[_i];
                    stats.processed++;
                    _k.label = 4;
                case 4:
                    _k.trys.push([4, 9, , 10]);
                    existingStatus = guest.profileStatus;
                    if (!existingStatus) {
                        console.log("\u26A0\uFE0F  Guest ".concat(stats.processed, "/").concat(stats.totalGuests, " (").concat(guest.name, "): No GuestProfileStatus - skipping"));
                        stats.skipped++;
                        return [3 /*break*/, 10];
                    }
                    existingHistory = [];
                    try {
                        existingHistory = existingStatus.statusHistory || [];
                    }
                    catch (e) {
                        existingHistory = [];
                    }
                    newEvents = [];
                    hasAccountCreated = existingHistory.some(function (e) {
                        return e.action === 'ACCOUNT_CREATED' || e.action === 'NOTE_ADDED';
                    });
                    if (!hasAccountCreated && guest.memberSince) {
                        newEvents.push({
                            timestamp: guest.memberSince.toISOString(),
                            action: 'ACCOUNT_CREATED',
                            description: 'Account created - Welcome to ItWhip!',
                            performedBy: 'SYSTEM',
                            metadata: {
                                email: guest.email,
                                name: guest.name,
                                city: guest.city,
                                state: guest.state
                            }
                        });
                    }
                    return [4 /*yield*/, prisma.rentalBooking.findMany({
                            where: {
                                OR: [
                                    { reviewerProfileId: guest.id },
                                    { guestEmail: guest.email || '' }
                                ]
                            },
                            include: {
                                car: {
                                    select: {
                                        year: true,
                                        make: true,
                                        model: true
                                    }
                                },
                                tripCharges: {
                                    select: {
                                        mileageCharge: true,
                                        fuelCharge: true,
                                        lateCharge: true,
                                        damageCharge: true,
                                        cleaningCharge: true,
                                        totalCharges: true
                                    }
                                }
                            },
                            orderBy: {
                                createdAt: 'asc'
                            }
                        })
                        // Process each booking
                    ];
                case 5:
                    bookings = _k.sent();
                    // Process each booking
                    for (_a = 0, bookings_1 = bookings; _a < bookings_1.length; _a++) {
                        booking = bookings_1[_a];
                        carName = "".concat((_c = booking.car) === null || _c === void 0 ? void 0 : _c.year, " ").concat((_d = booking.car) === null || _d === void 0 ? void 0 : _d.make, " ").concat((_e = booking.car) === null || _e === void 0 ? void 0 : _e.model);
                        // 2. BOOKING_CREATED
                        newEvents.push({
                            timestamp: booking.createdAt.toISOString(),
                            action: 'BOOKING_CREATED',
                            description: "Booked ".concat(carName, " for ").concat(booking.startDate.toLocaleDateString(), " - ").concat(booking.endDate.toLocaleDateString()),
                            performedBy: 'GUEST',
                            metadata: {
                                bookingId: booking.id,
                                carName: carName,
                                startDate: booking.startDate.toISOString(),
                                endDate: booking.endDate.toISOString(),
                                totalAmount: booking.totalAmount,
                                status: booking.status
                            }
                        });
                        // 3. DOCUMENT_UPLOADED (if documents exist and booking is first one)
                        if (bookings.indexOf(booking) === 0 &&
                            (guest.governmentIdUrl || guest.driversLicenseUrl || guest.selfieUrl)) {
                            uploadTime = new Date(booking.createdAt.getTime() + 5 * 60 * 1000);
                            documentsUploaded = [];
                            if (guest.governmentIdUrl)
                                documentsUploaded.push('Government ID');
                            if (guest.driversLicenseUrl)
                                documentsUploaded.push('Driver\'s License');
                            if (guest.selfieUrl)
                                documentsUploaded.push('Verification Selfie');
                            newEvents.push({
                                timestamp: uploadTime.toISOString(),
                                action: 'DOCUMENT_UPLOADED',
                                description: "Documents uploaded: ".concat(documentsUploaded.join(', ')),
                                performedBy: 'GUEST',
                                metadata: {
                                    documentsUploaded: documentsUploaded,
                                    count: documentsUploaded.length,
                                    governmentIdType: guest.governmentIdType
                                }
                            });
                        }
                        // 4. DOCUMENT_VERIFIED (only once, for first booking)
                        if (bookings.indexOf(booking) === 0 && guest.documentVerifiedAt) {
                            newEvents.push({
                                timestamp: guest.documentVerifiedAt.toISOString(),
                                action: 'DOCUMENT_VERIFIED',
                                description: 'Documents verified by admin - Instant book enabled',
                                performedBy: 'ADMIN',
                                metadata: {
                                    verifiedBy: guest.documentVerifiedBy,
                                    documentsVerified: true
                                }
                            });
                        }
                        // 5. TRIP_STARTED
                        if (booking.tripStartedAt) {
                            newEvents.push({
                                timestamp: booking.tripStartedAt.toISOString(),
                                action: 'TRIP_STARTED',
                                description: "Trip started for ".concat(carName),
                                performedBy: 'GUEST',
                                metadata: {
                                    bookingId: booking.id,
                                    carName: carName,
                                    startMileage: booking.startMileage,
                                    fuelLevelStart: booking.fuelLevelStart
                                }
                            });
                        }
                        // 6. TRIP_ENDED
                        if (booking.tripEndedAt) {
                            milesDriven = booking.endMileage && booking.startMileage
                                ? booking.endMileage - booking.startMileage
                                : null;
                            tripCharge = (_f = booking.tripCharges) === null || _f === void 0 ? void 0 : _f[0];
                            totalCharges = tripCharge ? Number(tripCharge.totalCharges) : 0;
                            chargeDescription = 'No additional charges';
                            if (totalCharges > 0) {
                                chargeDescription = "$".concat(totalCharges.toFixed(2), " in additional charges");
                            }
                            newEvents.push({
                                timestamp: booking.tripEndedAt.toISOString(),
                                action: 'TRIP_ENDED',
                                description: "Trip ended for ".concat(carName, " - ").concat(chargeDescription),
                                performedBy: 'GUEST',
                                metadata: {
                                    bookingId: booking.id,
                                    carName: carName,
                                    milesDriven: milesDriven,
                                    endMileage: booking.endMileage,
                                    fuelLevelEnd: booking.fuelLevelEnd,
                                    totalCharges: totalCharges,
                                    mileageCharge: tripCharge ? Number(tripCharge.mileageCharge) : 0,
                                    fuelCharge: tripCharge ? Number(tripCharge.fuelCharge) : 0,
                                    lateCharge: tripCharge ? Number(tripCharge.lateCharge) : 0
                                }
                            });
                        }
                    }
                    return [4 /*yield*/, prisma.rentalReview.findMany({
                            where: {
                                reviewerProfileId: guest.id
                            },
                            include: {
                                car: {
                                    select: {
                                        year: true,
                                        make: true,
                                        model: true
                                    }
                                }
                            },
                            orderBy: {
                                createdAt: 'asc'
                            }
                        })
                        // 7. REVIEW_SUBMITTED
                    ];
                case 6:
                    reviews = _k.sent();
                    // 7. REVIEW_SUBMITTED
                    for (_b = 0, reviews_1 = reviews; _b < reviews_1.length; _b++) {
                        review = reviews_1[_b];
                        carName = "".concat((_g = review.car) === null || _g === void 0 ? void 0 : _g.year, " ").concat((_h = review.car) === null || _h === void 0 ? void 0 : _h.make, " ").concat((_j = review.car) === null || _j === void 0 ? void 0 : _j.model);
                        stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
                        newEvents.push({
                            timestamp: review.createdAt.toISOString(),
                            action: 'REVIEW_SUBMITTED',
                            description: "Review submitted for ".concat(carName, " - ").concat(stars, " (").concat(review.rating, "/5)"),
                            performedBy: 'GUEST',
                            metadata: {
                                reviewId: review.id,
                                bookingId: review.bookingId,
                                carName: carName,
                                rating: review.rating,
                                title: review.title,
                                hasComment: !!review.comment
                            }
                        });
                    }
                    mergedHistory = __spreadArray(__spreadArray([], existingHistory, true), newEvents, true);
                    // Sort by timestamp
                    mergedHistory.sort(function (a, b) {
                        var timeA = typeof a.timestamp === 'string' ? new Date(a.timestamp) : a.timestamp;
                        var timeB = typeof b.timestamp === 'string' ? new Date(b.timestamp) : b.timestamp;
                        return timeA.getTime() - timeB.getTime();
                    });
                    stats.totalEventsAdded += newEvents.length;
                    if (!(!DRY_RUN && newEvents.length > 0)) return [3 /*break*/, 8];
                    return [4 /*yield*/, prisma.guestProfileStatus.update({
                            where: { guestId: guest.id },
                            data: {
                                statusHistory: mergedHistory,
                                updatedAt: new Date()
                            }
                        })];
                case 7:
                    _k.sent();
                    _k.label = 8;
                case 8:
                    percentage = ((stats.processed / stats.totalGuests) * 100).toFixed(1);
                    if (newEvents.length > 0) {
                        console.log("\u2705 Guest ".concat(stats.processed, "/").concat(stats.totalGuests, " (").concat(percentage, "%) - ").concat(guest.name, ": ").concat(newEvents.length, " new events added (").concat(mergedHistory.length, " total)"));
                        stats.success++;
                    }
                    else {
                        console.log("\u23ED\uFE0F  Guest ".concat(stats.processed, "/").concat(stats.totalGuests, " (").concat(percentage, "%) - ").concat(guest.name, ": No new events to add"));
                    }
                    return [3 /*break*/, 10];
                case 9:
                    error_1 = _k.sent();
                    stats.errors++;
                    errorMessage = error_1 instanceof Error ? error_1.message : 'Unknown error';
                    stats.errorDetails.push({
                        guest: "".concat(guest.name, " (").concat(guest.email, ")"),
                        error: errorMessage
                    });
                    console.log("\u274C Guest ".concat(stats.processed, "/").concat(stats.totalGuests, " - ").concat(guest.name, ": ERROR - ").concat(errorMessage));
                    return [3 /*break*/, 10];
                case 10:
                    _i++;
                    return [3 /*break*/, 3];
                case 11:
                    // ========================================================================
                    // STEP 3: Summary Report
                    // ========================================================================
                    console.log('\n' + '='.repeat(60));
                    console.log('📊 MIGRATION COMPLETE - SUMMARY REPORT');
                    console.log('='.repeat(60));
                    console.log('');
                    console.log("Total Guests:           ".concat(stats.totalGuests));
                    console.log("Processed:              ".concat(stats.processed));
                    console.log("\u2705 Success:             ".concat(stats.success, " (").concat(((stats.success / stats.totalGuests) * 100).toFixed(1), "%)"));
                    console.log("\u23ED\uFE0F  No Changes:          ".concat(stats.processed - stats.success - stats.errors - stats.skipped));
                    console.log("\u23ED\uFE0F  Skipped:             ".concat(stats.skipped, " (no status record)"));
                    console.log("\u274C Errors:              ".concat(stats.errors));
                    console.log("\uD83D\uDCDD Total Events Added:   ".concat(stats.totalEventsAdded));
                    console.log('');
                    if (stats.errors > 0) {
                        console.log('❌ ERRORS ENCOUNTERED:');
                        console.log('-'.repeat(60));
                        stats.errorDetails.forEach(function (_a) {
                            var guest = _a.guest, error = _a.error;
                            console.log("   Guest: ".concat(guest));
                            console.log("   Error: ".concat(error));
                            console.log('');
                        });
                    }
                    if (DRY_RUN) {
                        console.log('🔍 DRY RUN COMPLETE - No data was written to database');
                        console.log('   Run without --dry-run flag to execute migration');
                    }
                    else {
                        console.log('🎉 MIGRATION COMPLETE - Guest timelines have been updated!');
                        console.log('   Check the Status Tab for any guest to see their complete timeline');
                    }
                    console.log('');
                    console.log('='.repeat(60));
                    return [3 /*break*/, 15];
                case 12:
                    error_2 = _k.sent();
                    console.error('\n❌ FATAL ERROR:', error_2);
                    throw error_2;
                case 13: return [4 /*yield*/, prisma.$disconnect()];
                case 14:
                    _k.sent();
                    return [7 /*endfinally*/];
                case 15: return [2 /*return*/];
            }
        });
    });
}
// ============================================================================
// RUN MIGRATION
// ============================================================================
backfillGuestTimelines()
    .then(function () {
    console.log('✅ Script completed successfully');
    process.exit(0);
})
    .catch(function (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
});
