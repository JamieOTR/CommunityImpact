# Application User Flow Document

This document outlines the primary user flows for the AI-Powered Community Impact Tracker. Its purpose is to visualize the user journey, identify potential gaps, and ensure a cohesive user experience.

---

## 1. New User Onboarding Flow

This flow describes the journey of a new user from signing up to becoming an active member of the platform.

1.  **Landing Page:** User visits the main landing page and clicks "Sign Up".
2.  **Sign-Up Form:** User provides basic information (email, password, name).
3.  **Community Association (CRITICAL STEP):**
    *   After sign-up, the user is presented with two choices:
        *   **A) Create a New Community:**
            1.  User is directed to a "Create Community" form.
            2.  Fills in community name and description.
            3.  On submission, a new community is created, and a unique referral code is generated.
            4.  The user is automatically assigned as the community admin.
            5.  User is redirected to the Community Admin Dashboard.
        *   **B) Join an Existing Community:**
            1.  User is prompted to enter a referral code.
            2.  System validates the code.
            3.  On successful validation, the user becomes a member of the corresponding community.
            4.  User is redirected to the main Participant Dashboard.
4.  **Onboarding Complete:** The user is now fully onboarded and can access the application's features based on their role (Admin or Participant).

---

## 2. Community Administrator Flow

This flow describes the actions available to a user who is an administrator of a community.

1.  **Login:** Admin logs into the platform.
2.  **Navigation:** Admin can access a special "Admin Dashboard" link in the navigation.
3.  **Admin Dashboard:** The dashboard presents several management panels:
    *   **Referral Code Panel:** Displays the community's unique referral code for sharing.
    *   **Member Management Panel:** Lists all community members. (Future features: invite/remove members).
    *   **Program Management Panel:**
        1.  Admin can create new programs (e.g., "Q3 Literacy Drive").
        2.  Admin can view/edit existing programs.
    *   **Milestone Management Panel:**
        1.  Within a program, the admin can create new milestones (e.g., "Read 5 books").
        2.  Admin defines milestone details: description, reward amount, verification criteria.
    *   **Analytics Panel:** Views overall community impact metrics and progress.

---

## 3. Community Participant Flow

This flow describes the journey of a regular, non-admin community member.

1.  **Login:** Participant logs into the platform.
2.  **Main Dashboard:** User lands on the main dashboard and sees:
    *   Their token balance.
    *   Overall community impact metrics.
    *   A leaderboard.
3.  **View Milestones:**
    *   User navigates to a "Milestones" page.
    *   Views a list of available milestones for the programs in their community.
4.  **Complete a Milestone:**
    *   User performs the required action for a milestone.
    *   User navigates to the milestone submission UI.
    *   Submits evidence of completion (e.g., a photo, a document link).
5.  **Verification & Reward:**
    *   The system verifies the submission (automated or manual).
    *   Upon successful verification, the smart contract is triggered, and the user receives a token reward.
    *   The user's achievement is recorded on their profile and the blockchain.
6.  **AI Interaction:**
    *   At any point, the user can interact with the conversational AI for guidance on milestones, questions about the program, or motivational support. 