import { z } from "zod";

export const AthleteObject = z.object({
  // Basic details --
  stateUnit: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  mainEvent: z.string(),
  playingEvents: z.object({
    rifle: z.string(),
    pistol: z.string(),
    shotgun: z.string(),
    bigbore: z.string(),
  }),

  education: z.string(),
  dateOfBirth: z.string(),
  placeOfBirth: z.string(),
  email: z.string().email(),
  contactNumber: z.string(),
  alternateContactNumber: z.string(),
  gender: z
    .string(),
    // .refine((val) => val === "male" || val === "female", {
    //   message: "Gender must be either 'male' or 'female'",
    // }),

  // Personal details --
  motherName: z.string(),
  fatherName: z.string(),
  maritalStatus: z.string(),
  spouseName: z.string(),
  height: z.string(),
  weight: z.string(),
  trackSuit: z.string(),
  tshirtSize: z.string(),
  shoeSize: z.string(),

  // address --
  address: z.string(),
  stateName: z.string(),
  cityName: z.string(),
  pincode: z.string(),
  mailingAddress: z.string().optional(),
  // addressProof: z.string(),

  // passport --
  passportNumber: z.string().optional().nullable(),
  dateOfIssue: z.string().optional().nullable(),
  passportIssueAuthority: z.string().optional().nullable(),
  dateOfExpiry: z.string().optional().nullable(),
  placeOfIssue: z.string().optional().nullable(),
  // passportImage: z.string().optional(),

  // Shooter membership --
  main: z.string(),
  type: z.string(),
  subtype: z.string(),
  selectLifeOthers: z.string().optional(),
  membershipNumber: z.string(),
  paymentRemark: z.string().optional(),
  feesFirstYear: z.string().optional(),
  feesYearlyRenewal: z.string().optional(),
  feesOnUpdate: z.string().optional(),
  showValidity: z.boolean().optional(),
  validity: z.string().optional(),
  membershipOfClubDru: z.boolean().optional(),
  arjunaAwardee: z.string() /* .boolean() */ .optional(),
  internationalAwardee: z.string() /* .boolean() */ .optional(),
  // bondSubmissionDate: z.string().optional(),
  // indemnityBond: z.string().optional(),

  // Club DRA listing --
  name: z.string().optional(),
  approval: z.boolean().optional(),
  status: z.boolean().optional(),

  fireArms: z.array(
    z.object({
      weapon_type: z.string(),
      make: z.string(),
      model: z.string(),
      calibre: z.string(),
      serial_no: z.string().optional(),
      sticker: z.string().optional(),
    })
  ),
  coachDetails: z.array(
    z.object({
      coach_name: z.string().optional(),
      from_date: z.string().optional(),
      to_date: z.string().optional(),
    })
  ),
});

const CreateAthletepayload = {
  body: AthleteObject,
};

export const CreateAthleteSchema = z.object({
  ...CreateAthletepayload,
});
