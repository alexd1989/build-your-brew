# AI Rules for Resume Builder Application

This document outlines the technical stack and guidelines for developing features within this application.

## Tech Stack Overview

*   **Frontend Framework:** React with TypeScript for building dynamic user interfaces.
*   **Build Tool:** Vite for a fast development experience and optimized builds.
*   **Styling:** Tailwind CSS for utility-first styling, ensuring a consistent and responsive design.
*   **UI Components:** shadcn/ui, a collection of reusable components built on Radix UI and styled with Tailwind CSS.
*   **Routing:** React Router for declarative client-side navigation.
*   **Backend & Database:** Supabase for authentication, database management, and serverless functions.
*   **Data Fetching:** React Query for efficient server state management and data synchronization.
*   **Icons:** Lucide React for a comprehensive set of customizable SVG icons.
*   **Toast Notifications:** Sonner for beautiful and accessible toast messages.
*   **PDF Generation:** `html2canvas` and `jspdf` for client-side PDF creation.

## Library Usage Guidelines

To maintain consistency and efficiency, please adhere to the following rules when implementing new features or modifying existing ones:

*   **React & TypeScript:** Always use React for UI development and TypeScript for type safety.
*   **Styling:** All styling must be done using Tailwind CSS classes. Avoid inline styles or separate CSS files unless absolutely necessary for third-party libraries that don't support Tailwind.
*   **UI Components (shadcn/ui):**
    *   Prioritize using components from `shadcn/ui` (e.g., `Button`, `Input`, `Card`, `Dialog`, `Select`, `Textarea`, `Checkbox`, `Label`, `Switch`, `Table`, `DropdownMenu`, `AlertDialog`, `Avatar`, `Separator`, `Tabs`).
    *   If a required component is not available in `shadcn/ui` or needs significant custom behavior, create a new component in `src/components/` and style it with Tailwind CSS.
    *   **DO NOT** modify the source files of `shadcn/ui` components directly (e.g., files in `src/components/ui/`).
*   **Routing:** Use `react-router-dom` for all navigation. Define routes in `src/App.tsx`.
*   **Backend Interactions:** All backend operations (authentication, database queries, function calls) must use the `supabase` client imported from `src/integrations/supabase/client.ts`.
*   **Data Management:** For fetching, caching, and updating server data, use `react-query`.
*   **Icons:** Use icons from `lucide-react`.
*   **Notifications:** Use `sonner` for all user notifications (toasts).
*   **PDF Generation:** Utilize the `generatePDF` function from `src/lib/pdf-generator.ts` for creating PDF documents.

## Connecting to Supabase

Supabase is already integrated into the application.

1.  **Client Initialization:** The Supabase client is initialized in `src/integrations/supabase/client.ts`. You can import `supabase` from this file to interact with your Supabase project.
    ```typescript
    import { supabase } from "@/integrations/supabase/client";
    ```
2.  **Environment Variables:** Ensure your Supabase URL and public key are correctly configured. These are currently hardcoded in `src/integrations/supabase/client.ts` for demonstration purposes. For production, it's recommended to use environment variables.
    *   `VITE_SUPABASE_URL`
    *   `VITE_SUPABASE_ANON_KEY`
3.  **Authentication:** The `useAuth` hook in `src/hooks/useAuth.tsx` provides convenient methods for user authentication (sign up, sign in, sign out) and accessing user session information.
4.  **Database Interactions:** Use the `supabase` client to perform CRUD operations on your database tables as defined in `src/integrations/supabase/types.ts`.
5.  **Serverless Functions:** To invoke Supabase Edge Functions, use `supabase.functions.invoke()`. An example is already present in `src/components/ResumeBuilder.tsx` for AI description generation.

If you need to add Supabase to your app (e.g., if it's a new project or the integration was removed), you can use the following command:
<dyad-add-integration provider="supabase"></dyad-add-integration>