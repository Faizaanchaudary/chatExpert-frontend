# ChatExport — Full Technical Documentation

This document is a deep technical analysis of the **ChatExport** React Native codebase, explaining architecture, flows, APIs, state, screens, and implementation details from A to Z.

---

## 1. Project Overview

### What the Project Does

**ChatExport** is a **React Native mobile application** that lets users:

1. **Turn WhatsApp chat exports into physical/digital keepsakes** — Users can import WhatsApp chat exports (ZIP containing `.txt` + media), customize the look (fonts, colors, date format, sort order), and create “Chat Books” (photo-book style layouts).
2. **Manage multiple chat drafts and books** — Drafts are saved in Redux (persisted); users can continue editing, view as Standard/Square/Open book layouts, and add chats to a cart.
3. **E‑commerce flow** — Users choose book format (Standard/Square), see product details, add to cart with options (e.g. include e‑book, book cover, quantity), manage addresses, and go through a payment method screen (UI only; no real payment integration).
4. **User account and profile** — Email/password login and registration (backend + Firebase for sign-up), Google Sign-In (configured but not wired to backend login), forgot password with OTP, edit profile (name, phone, profile picture), addresses CRUD, and logout.

Inferred from code:

- **Target users:** End consumers who want to preserve WhatsApp conversations as printed/digital books (gift, memory, etc.).
- **Core purpose:** Import WhatsApp chat export → customize → save as draft → optionally add to cart → checkout (UI) and order management.

### App Architecture Type

- **Feature/screen-based structure** with shared **components**, **services**, **store**, and **navigation**.
- **Not** a strict modular monorepo; it’s a **single React Native app** with:
  - **Screens** under `app/screens/` (grouped by feature: Auth, Tabs, Book, Cart, Profile, etc.).
  - **Redux** for global state (user, chats, snackbar).
  - **REST API client** (Axios) for backend; **Firebase** (Auth, Storage) for sign-up and media upload path helpers.
  - **No Expo** — bare React Native CLI (see `package.json` scripts: `react-native run-android` / `run-ios`).

### High-Level Flow (Launch to Exit)

1. **Entry:** `index.js` → `AppRegistry` registers `App` from `App.tsx`.
2. **App.tsx:** Requests Android storage permissions (read/write), wraps app in Redux `Provider`, `PersistGate`, and `GestureHandlerRootView`; renders `NavigationStack`.
3. **Navigation:** Root is a single **native stack** with `initialRouteName="Splash"`. No route guards; auth decision is done on **Splash** by reading Redux `user` (persisted).
4. **Splash:** After 2s (timer is set but empty callback), user taps forward → if `user` exists → `navigation.replace("BottomTab")`, else → `navigation.replace("LogIn")`.
5. **Auth:** LogIn (email/password + optional Google) or CreateAccount (Firebase createUser + optional Google). On success, `onLogin`/equivalent dispatches user + token; navigation resets to `BottomTab`.
6. **Main app (BottomTab):** Four tabs — Shop, Draft, Cart (actually CartProducts), Profile (stack: Profile → MyOrders). From Shop → ChooseFormat → CreateYourDesign → BookList (or open Chat to import). From Draft → BookList with selected draft. From Cart → CartProducts (cart from Redux). Profile → EditProfile, Addresses, ContactUs, Logout (resets to Splash).
7. **Chat flow:** User can open Chat from BookList (“Import”) or via **Android intent** (WhatsApp export). Intent delivers URI → unzip → parse `.txt` (and optionally Groq AI) → edit (fonts, colors, date, sort) → Done → `createChat` + `uploadChatMedia` + `bulkMessages` → save to Redux `savedChats` and `currentChat`/`chatMessages` → navigate back.
8. **Exit:** User can logout from Profile → `onLogout()` + reset to Splash; or close app (Redux state persists via redux-persist).

---

## 2. Tech Stack (Why Each Is Used)

### Frontend

| Technology | Version / Choice | Why Used | Where Used |
|-----------|------------------|----------|------------|
| **React Native** | 0.74.3 | Core framework for iOS/Android. | Entire app. |
| **Expo or CLI** | **CLI (bare)** | No Expo; `react-native run-android` / `run-ios`. Enables native modules (Firebase, Google Sign-In, RNFS, etc.). | `package.json` scripts. |
| **TypeScript** | Yes (tsconfig strict) | Type safety, interfaces for API/state. | All `app/` sources; `env.d.ts` for `@env`. |
| **State management** | **Redux Toolkit + Redux Persist** | Centralized global state (user, token, savedChats, cartChats, currentChat, chatMessages); persistence across restarts. | `app/store/Store.tsx`, slices under `app/store/Slice/`. |
| **Navigation** | **React Navigation** (native-stack + bottom-tabs) | Stack for auth/shop/book flows; tabs for main app. | `app/navigation/NavigationStack.tsx`, `BottomTabNavigation/index.tsx`. |
| **UI** | Custom components + React Native primitives | No global UI library; custom buttons, inputs, headers, modals. | `app/Components/`, screens. |
| **Forms** | Local state + `CustomInputField` | No form library; controlled inputs and validation in screen logic. | LogIn, CreateAccount, LostYourPassword, CreateNewPassword, EditProfile, AddAnAddress, PayMentMethod. |
| **Validation** | Custom `validateEmail` + inline checks | Email regex in `app/utils/reponsiveness.ts`; password length, non-empty, match in screens. | LogIn, CreateAccount, LostYourPassword, CreateNewPassword. |
| **Styling** | **StyleSheet** (React Native) + responsive utils | No Tailwind/CSS-in-JS. Per-screen/style files; `wp`, `hp`, `rfs`, `rhp`, `rwp` from `reponsiveness.ts` for scaling. | All `style.tsx`/`style.ts` next to screens/components; `app/utils/colors.ts`, `fonts.ts`. |

### Key Dependencies (Purpose and Usage)

- **@reduxjs/toolkit** — Slices (user, chat, snackbar), `configureStore`, typed hooks.
- **redux-persist + AsyncStorage** — Persist root reducer (except snackbar/temp); rehydrate on launch.
- **@react-navigation/native, native-stack, bottom-tabs** — Stack and tab navigators; headers hidden, custom headers used.
- **axios** — API client; base URL from env; interceptors for auth header and 401.
- **@react-native-firebase/app, auth, storage** — Firebase Auth for CreateAccount (email/password); Storage for `uploadToFirebase` (media path helper used in storage service).
- **@react-native-google-signin/google-signin** — Google Sign-In; configured with `googleLoginKey` from env; used on LogIn and CreateAccount but result not sent to backend in current code.
- **react-native-config** — Listed in package.json but **not** used for env in app code; **react-native-dotenv** is used (see `app/config.ts` and `babel.config.js`).
- **react-native-dotenv** — Babel plugin; injects `GROQ_API_KEY`, `baseUrl`, `googleLoginKey` from `.env` into `@env`; consumed by `app/config.ts`.
- **@shopify/flash-list** — Performant list for chat messages on Chat screen (`getItemType`, `estimatedItemSize`).
- **react-native-sse** — SSE client for Groq streaming API in `useChatParser` (WhatsApp text → NDJSON messages).
- **react-native-fs** — Read/unzip export, read `.txt`, list files in `import-chat-helpers.ts` and Chat screen.
- **react-native-zip-archive** — Unzip WhatsApp export.
- **react-native-document-picker** — Optional manual ZIP pick (commented in Chat).
- **react-native-image-crop-picker** — EditProfile profile picture picker.
- **react-native-keyboard-aware-scroll-view** — Scroll adjustment on focus for auth/profile/address forms.
- **rn-declarative** — `useMediaContext()` (isPhone, isTablet, isDesktop) for responsive UI in BottomTab and Chat.
- **moment** — Date formatting across screens and chat.
- **uuid** — Generate `_id` for parsed messages and `savedChatId` when saving chat.
- **mime** — MIME types for file upload (e.g. `getMimeType` in Chat).
- **react-native-text-size-latest** — Measure text height for pagination in `usePaginatedMessages` (BookList).

### Backend

- **Presence:** Yes — REST API. Base URL from `.env` → `baseUrl` (e.g. `https://api.yourdomain.com/v1`).
- **Technology:** Not in repo; inferred from `app/services/client.ts` and `calls.ts` / `chatApi.ts`: REST (JSON), JWT-style Bearer token.
- **Authentication:** Token in Redux (`state.user.token`). Login/register return `user` + `token`; token sent as `Authorization: Bearer <token>` by Axios request interceptor. No refresh logic in code; 401 passed through and rejected.
- **Database:** Unknown (backend not in repo).
- **API usage:** User (register, login, forgotPassword, verify OTP, reset password, updateProfile, uploadContent), addresses (get, add, remove), chats (create, get, upload media, bulk messages). See §9 for details.

### Frontend–Backend Communication

- **Lifecycle:** Component/service calls `apiClient.get/post/put/delete` → request interceptor adds `Authorization: Bearer ${store.getState().user.token}` (and logs) → backend responds → response interceptor returns response or rejects on 401.
- **Error handling:** 401 → `Promise.reject(err)`; others same. Screens catch and show `err?.response?.data?.error` in Alert or snackbar.
- **Token storage:** Token kept in Redux only (from login/register response); Redux state persisted via redux-persist in AsyncStorage. No dedicated secure store (e.g. Keychain); see §12.

---

## 3. Third-Party APIs & Services

### 3.1 Groq AI (LLM)

- **Purpose:** Parse WhatsApp export `.txt` into structured messages (NDJSON) when using AI parsing path.
- **Where:** `app/hooks/useChatParser.ts`.
- **Config:** `Config.GROQ_API_KEY` from `.env` (`GROQ_API_KEY`).
- **Flow:** Chat text is split into ~8KB chunks; for each chunk an SSE request to `https://api.groq.com/openai/v1/chat/completions` with model `llama-3.3-70b-versatile`, stream: true. Prompt asks for NDJSON lines: date, time, sender, message, media/messageType. Incoming tokens buffered; complete lines parsed to `AiParsedMessage` then converted to `IMessage` (with `uuid`), matched to `mediaFiles` by filename; only text/image/video/audio pushed to buffer. Buffer flushed to parent every 300ms.
- **Response handling:** SSE `message` events; on `[DONE]` chunk is closed. Errors close stream and reject; Alert on parse failure.
- **Security:** API key in `.env` (must not be committed). Key is in client bundle (Babel injects at build time) — for production, parsing should ideally run server-side.
- **Failure:** Network/API errors → reject; user sees Alert “Couldn’t parse all chunks. Try Later...”. No retry in code.

### 3.2 Firebase

- **Auth:** `@react-native-firebase/auth` — `createUserWithEmailAndPassword(getAuth(), email, password)` in CreateAccount. No backend user creation in current flow; after success, navigation resets to BottomTab (no token from backend for that path).
- **Storage:** `@react-native-firebase/storage` — `storage().ref(path).putFile(localPath)` and `getDownloadURL()` in `app/services/storage.ts`. Used by `createWhatsappMediaPath` and `uploadToFirebase`; actual upload from Chat screen uses backend `uploadChatMedia` (FormData), not necessarily Firebase in the main path.
- **Implications:** Firebase used for sign-up and optional media storage; sensitive data (e.g. API keys) must not be in client if possible.

### 3.3 Google Sign-In

- **Library:** `@react-native-google-signin/google-signin`.
- **Config:** `GoogleSignin.configure({ webClientId: Config.googleLoginKey, offlineAccess: false })` on button press (LogIn, CreateAccount). Then `signOut()` and `signIn()`; result has `idToken`, `user` (name, email).
- **Usage:** Currently the idToken/user are not sent to the app backend to complete login; flow is incomplete for “Continue with Google”.

### 3.4 Backend REST API

- **Base URL:** `Config.baseUrl` from `.env` (`baseUrl`).
- **Auth:** Bearer token from Redux in request interceptor.
- **Endpoints used:**  
  - User: `POST user/register`, `POST user/login`, `POST user/forgot-password`, `POST user/verifyreset-password`, `POST user/reset-password`, `PUT user/updatePhoneAndProfilePicture`, `POST upload/upload-content`.  
  - Address: `GET api/v1/address`, `POST api/v1/address/add`, `DELETE api/v1/address/:id`.  
  - Chat: `GET chats` (createChat in code uses GET with params — likely should be POST), `GET chats/:id`, `POST chats/:id/media`, `POST messages/bulk`.
- **Data/response:** JSON; errors in `err.response.data.error` or `errors`. No documented retry or timeout in client (default Axios).

### 3.5 Android Intent (WhatsApp export)

- **Mechanism:** Native module `CustomIntent` opens WhatsApp; `NativeEventEmitter` listens for `IntentReceived` with file URI (ZIP export).
- **Where:** Chat screen `useEffect` with `IntentReceived`; `loadViaRoute(uri)`.
- **Flow:** URI can be `content://` or `file://`. For `content://`, uses `ContentResolverModule.copyContentUriToFile` (or RNFS fallback) to temp file, then unzip to `RNFS.DocumentDirectoryPath/extracted`, then `getFilesInformation` + `getFileContent` → `setWhatsappChatData({ mediaFiles, chatText })` which triggers `useChatParser` (Groq) or local parsing.
- **Failure:** Copy/unzip/read errors → Alert with message; no retry.

### 3.6 No Other Major SDKs

- No Stripe/Razorpay, OneSignal, Sentry, analytics, or Map SDKs in the analyzed code. Payment screen is UI-only (Pay 29$, Google Pay / Apple Pay buttons without integration).

---

## 4. Folder Structure (Deep Explanation)

```
d:\ChatExport\
├── App.tsx                 # Root: permissions, Provider, PersistGate, GestureHandler, NavigationStack
├── index.js                # Entry: AppRegistry
├── app.json                # App name/displayName
├── app/
│   ├── config.ts           # Reads @env (GROQ_API_KEY, baseUrl, googleLoginKey)
│   ├── assets/             # img/, icons/ — static images and icons
│   ├── constants/          # mediaExtensions.ts (media file extensions)
│   ├── interfaces/        # IUser, IChat, IMessage, IBookConfig, IItem, whatsappMessage, etc.
│   ├── utils/              # reponsiveness (wp/hp/rfs), colors, fonts, dateUtils, mediaUtils,
│   │                       # import-chat-helpers (parseChat, getFilesInformation, getFileContent, processChatFile),
│   │                       # whatsapp-chat-helpers, pageUtils, functions, etc.
│   ├── store/
│   │   ├── Store.tsx       # configureStore, persist, rootReducer, useAppDispatch/useAppSelector
│   │   └── Slice/          # userSlice, chatSlice, snackbarSlice
│   ├── services/
│   │   ├── client.ts       # Axios instance, baseURL from config, request/response interceptors
│   │   ├── calls.ts        # register, login, forgotPassword, vertifyOtp, resetPassword, updateProfile,
│   │   │                   # uploadContent, getAddresses, removeAddress, addAddress
│   │   ├── chatApi.ts      # createChat, uploadChatMedia, getChat, bulkMessages
│   │   ├── storage.ts      # Firebase storage refs, createWhatsappMediaPath, uploadToFirebase
│   │   └── aiPaginationService.ts  # AIPaginationService class (height estimation, pagination strategies)
│   ├── hooks/
│   │   └── useChatParser.ts  # Groq SSE parsing of chat text → IMessage[]; chunked; buffer flush
│   ├── navigation/
│   │   ├── NavigationStack.tsx   # Root stack: Splash, LogIn, CreateAccount, LostYourPassword, CreateNewPassword,
│   │   │                         # BottomTab, ChooseFormat, CreateYourDesign, ContactUs, EditProfile, Addresses,
│   │   │                         # AddAnAddress, CartDetail, PayMentMethod, MyOrders, WaitLoader, BookList,
│   │   │                         # PurchaseSuccessful, CartProducts, EbookPurchase, EditPhotos, Chat
│   │   └── BottomTabNavigation/   # Tab navigator: ShopTab, DraftTab, CartProducts, Profile stack (ProfileTab → MyOrders)
│   ├── screens/            # One folder per screen; index.tsx + style.tsx
│   │   ├── Splash, LogIn, CreateAccount, LostYourPassword, CreateNewPassword
│   │   ├── Tabs/ (ShopTab, DraftTab, CartTab, ProfileTab)
│   │   ├── ChooseFormat, CreateYourDesign, BookList (with components/, hooks/, helpers, constants, types)
│   │   ├── Chat/
│   │   ├── CartProducts, CartDetail, PayMentMethod, PurchaseSuccessful, MyOrders
│   │   ├── EditProfile, EditPhotos, Addresses, AddAnAddress, ContactUs
│   │   └── WaitLoader
│   └── Components/         # Reusable UI: CustomButton, CustomInputField, CustomHeader, modals, cards, etc.
├── env.d.ts                # Declare @env module (GROQ_API_KEY, baseUrl, googleLoginKey)
├── .env                    # Secrets and baseUrl (not committed in production)
└── babel.config.js         # react-native-dotenv plugin for @env
```

**Why this structure:**

- **Single app root** under `app/` keeps navigation, store, services, and screens together.
- **Screens** own their layout and style; **Components** are shared (buttons, inputs, headers, modals, cards).
- **Store** is flat (user, chats, snackbar); slices are in one folder for predictability.
- **Services** separate HTTP (client, calls, chatApi) from Firebase (storage) and from pure logic (aiPaginationService).
- **BookList** is a feature with sub-folders (components, hooks, constants, types) because it has pagination, multiple page types, and layout logic.

**Scalability / modularity:** Adding a new screen = new folder under `screens/` + one Stack.Screen. New global state = new slice + combineReducers. New API domain = new file under `services/`. It’s scalable for this app size; for very large teams, splitting by domain (e.g. `features/chat`, `features/shop`) could be a next step.

---

## 5. App Flow (Very Detailed)

### 5.1 App Start

1. `index.js` registers `App` from `App.tsx`.
2. `App.tsx`:
   - `useEffect`: On Android, `PermissionsAndroid.requestMultiple([READ_EXTERNAL_STORAGE, WRITE_EXTERNAL_STORAGE])`; result not blocking render (only console.warn on failure).
   - Renders: `Provider(store)` → `PersistGate(loading={null}, persistor)` → `GestureHandlerRootView` → `NavigationStack`.
3. **PersistGate:** Waits for rehydration of persisted Redux state from AsyncStorage, then mounts children. No loading UI (`loading={null}`).
4. **NavigationStack:** `NavigationContainer` + single `Stack.Navigator` with `initialRouteName="Splash"`, `headerShown: false`, `gestureEnabled: false`.

### 5.2 Splash

- **Screen:** `app/screens/Splash/index.tsx`.
- **Logic:** `useSelector(state => state?.user?.user)`. `useEffect` runs a 2s `setTimeout` with empty callback (no automatic navigation). User must tap the forward button.
- **onPress:** If `user` truthy → `navigation.replace("BottomTab")`; else → `navigation.replace("LogIn")`.
- **No token validation:** Decision is only “is there a user in state?”. Expired token is not checked here.

### 5.3 Auth Check / Token

- There is **no** dedicated auth guard or token validation on navigation. Splash only checks persisted `user`. If token is expired, API calls will get 401; response interceptor rejects; screens show Alerts from `err.response.data.error`. No global “session expired” redirect or refresh.

### 5.4 Login Flow

- **LogIn screen:** Email + password; validate non-empty, email regex, password length ≥ 8. On submit → `login(email, password)` (POST `user/login`) → on 200/201: `dispatch(onLogin({ ...response.data.user, access_token: response.data.token }))`, then `CommonActions.reset` to BottomTab. On error: Alert with backend error or generic message. Google button calls `googleLogin()` (configure + signOut + signIn) but does not dispatch login or navigate.
- **CreateAccount:** Same validation for name, email, password, confirm password. Sign-up uses **Firebase** `createUserWithEmailAndPassword`; on success, reset to BottomTab (no backend token in this path). Google button same as LogIn (no backend link).

### 5.5 Forgot Password

- **LostYourPassword:** Name + email → `forgotPassword(email, name)` → on success `setResendTime(30)`, which triggers timer and opens EmailVerificationModal. User enters OTP → `vertifyOtp(codeHere, email)` → on success `closeModal()` which navigates to CreateNewPassword with email (as param). CreateNewPassword: new password + confirm → `resetPassword(route.params, password)` → on success reset to LogIn.

### 5.6 Main App (BottomTab)

- **Tabs:** Shop, Draft, Craft (CartProducts), Profile. Profile tab has listener to reset stack to Profile on tab press. CartProducts is the cart screen (cartChats from Redux).
- **Shop:** “Photo Book” CTA → `navigation.navigate('ChooseFormat')`. ChooseFormat → cards navigate to CreateYourDesign with `bookspecs` (price, title, dimensions). CreateYourDesign → “Let’s Create Your Design” → `navigation.navigate('BookList', { bookspecs })`.
- **BookList:** Can show list of saved chats (savedChats) or a single book (pages from `usePaginatedMessages`). “Import New Chat” / “Import Chat” → `navigation.navigate('Chat', {})`. From a draft card (DraftTab) → BookList with `uniqueId`, `bookspecs`, `isExtendedView`.

### 5.7 Chat Flow (Import → Edit → Done)

- **Entry:** From BookList “Import” or Android intent with ZIP URI.
- **Intent:** Listener in Chat calls `loadViaRoute(uri)`: copy content URI to temp file if needed, unzip to `extracted`, get media files + .txt content, set `whatsappChatData` → `useChatParser` runs (if chatText set) and appends to `chatMessages`. Alternative: “Load Dummy Data” sets `DUMMY_MESSAGES`.
- **Edit:** User can open Edit modal (date format, sort, colors, fonts, hide name). Sort/date/selection modals update `bookConfig` or filter state. “Done” (top right when messages exist): if no chat id, alert; else `uploadChatMedia` (if media), then `bulkMessages` with payload from `chatMessages` (date, messageType, senderName, sendingTime, text). Then dispatch `saveCurrentChat`, `saveCurrentChatMessages`, and `saveChat` with a new `uuid` and `{ ...finalChat, messages, timestamp }`. Then `navigation.goBack()`.

### 5.8 Logout

- **ProfileTab:** “Log out” → set `showLogOutModal` true. On confirm: `dispatch(onLogout())` (clears user/token/socialLogin), then `CommonActions.reset` to single route `Splash`.

### 5.9 Edge Cases

- **No user on Splash:** Replace to LogIn.
- **CreateAccount Firebase success but no backend user:** User is in app with no token; API calls will send `Bearer undefined` until they log in via LogIn.
- **Chat “Done” without chat created:** Alert “Chat not created yet.” (chat is created in useEffect when `user?._id` exists; race possible if Done is pressed before createChat resolves).
- **401 on any API call:** Rejected in interceptor; screen shows error; no automatic redirect to LogIn.

---

## 6. Screen-by-Screen Breakdown

### 6.1 Splash

- **Purpose:** Landing; decide between main app and login.
- **Access:** Everyone (initial route).
- **Data:** `user` from Redux.
- **State:** None local; 2s timer with no side effect.
- **API:** None.
- **Button:** Forward → replace to BottomTab or LogIn.
- **Navigation:** Replace only.
- **Validation / errors:** None.

### 6.2 LogIn

- **Purpose:** Email/password sign-in; link to CreateAccount and LostYourPassword; Google button.
- **Data:** Email, password (local state); user from Redux after login.
- **API:** `login(email, password)`.
- **Validation:** Non-empty, `validateEmail`, password length ≥ 8.
- **Submit:** `onSignIn` → login → on success dispatch `onLogin` and reset to BottomTab; on error Alert.
- **Loading:** `loading` state; CustomButton `animating={loading}`.

### 6.3 CreateAccount

- **Purpose:** Register with name, email, password, confirm password; Google option.
- **API:** Firebase `createUserWithEmailAndPassword` (no backend register in current flow).
- **Validation:** All fields, email format, password ≥ 8, password match.
- **On success:** Reset to BottomTab (no token in state for this path).

### 6.4 LostYourPassword

- **Purpose:** Request password reset (name + email), then OTP verification.
- **API:** `forgotPassword`, `vertifyOtp`.
- **State:** name, email, codeHere, resendTime, showModal, loading. Timer 30s for resend.
- **Navigation:** On verify success → CreateNewPassword (email as param).

### 6.5 CreateNewPassword

- **Purpose:** Set new password after OTP.
- **API:** `resetPassword(route?.params, password)`.
- **Validation:** Non-empty, length ≥ 8, match confirm. Button disabled if length < 5 or mismatch.
- **On success:** Reset to LogIn.

### 6.6 ShopTab

- **Purpose:** Welcome + “Photo Book” CTA.
- **Data:** `user?.fullName` from Redux.
- **Navigation:** “Photo Book” → ChooseFormat.

### 6.7 DraftTab

- **Purpose:** List saved drafts (from Redux `savedChats`).
- **Data:** `savedChats`; local state `draftCardData` derived (formatted + sorted by date).
- **API:** None (all from store).
- **List:** FlatList of DraftCard; empty state “No drafts found”. Card press → BookList with `uniqueId`, `bookspecs`, `isExtendedView`.

### 6.8 CartProducts (Craft tab)

- **Purpose:** Cart with products (bookSpecs), quantity, options (e.g. eBook, book cover, eBook only), subtotal, discount code, address, shipping.
- **Data:** Redux `cartChats`, `currentAddress`; local `validProducts` (filtered by bookSpecs), discount, showApplyCodeModal, showShippingOptions.
- **APIs:** None on this screen (addresses loaded elsewhere).
- **Actions:** deleteProduct (setCart), updateProductInCart (checkboxes, quantity), RedeemPress (sample discount), “Go for Shipping Options” / “Buy Now” (Buy Now not implemented). Navigate to Addresses, BookList (preview), BottomTab ShopTab.

### 6.9 ProfileTab

- **Purpose:** Profile card (avatar, name, Edit Profile), My orders, Addresses, Contact us, Log out.
- **Data:** `user` from Redux.
- **Navigation:** EditProfile, MyOrders, Addresses, ContactUs; Log out opens LogoutModal then dispatch onLogout + reset to Splash.

### 6.10 ChooseFormat

- **Purpose:** Choose Standard or Square book; pass bookspecs to CreateYourDesign.
- **Navigation:** Two ChooseFormatCards → CreateYourDesign with different bookspecs (price, title, dimensions).

### 6.11 CreateYourDesign

- **Purpose:** Product details and “Let’s Create Your Design” CTA.
- **Data:** `route?.params?.bookspecs`.
- **Navigation:** Button → BookList with `bookspecs`.

### 6.12 Chat

- **Purpose:** Import WhatsApp export (intent or dummy), parse (Groq or local), show messages in FlashList, customize (Edit modal: fonts, colors, date, sort), then Done to upload and save.
- **Data:** Redux: token, user; local: chat, chatMessages, chatDataFiltered, whatsappChatData, bookConfig, modals, search, sortOrder, isSubmitting, etc.
- **APIs:** createChat (on mount when user._id), uploadChatMedia (on Done if media), bulkMessages (on Done).
- **Intent:** IntentReceived → loadViaRoute(uri) → unzip, set whatsappChatData, useChatParser appends to chatMessages.
- **Done:** Build messages payload, uploadChatMedia if media, bulkMessages, then saveCurrentChat/saveCurrentChatMessages/saveChat, goBack.
- **Validation:** Done checks user and chat id; Alert on failure.
- **Loading:** isLoading during import; isSubmitting on Done.

### 6.13 BookList

- **Purpose:** Show either list of saved chats (“Your Books”) or a single book (paginated pages); support Standard/Square/Open layouts.
- **Data:** Redux currentChat, chatMessages, savedChats; route params uniqueId, bookspecs; local selectedChatId, currentPageIndex, isLoadingDraft.
- **Logic:** If selectedChatId + savedChats, load that chat into store (loadSavedChat). Messages shuffled with Fisher-Yates. usePaginatedMessages(messages, width, height) → pages. Book type from bookspecs (square/open/standard). Horizontal ScrollView for pages/spreads; page indicators.
- **Navigation:** Back (to previous chat or BottomTab ShopTab), “Import New Chat” / “Import Chat” → Chat.

### 6.14 EditProfile

- **Purpose:** Update fullName, phoneNumber, profile picture.
- **API:** updateProfile(FormData) with userId, fullName, phoneNumber, profilePictureUrl (file).
- **Data:** user from Redux; local firstName, phoneNumber, imageSource (from ImagePicker).

### 6.15 Addresses

- **Purpose:** List addresses; select current (for cart); delete; add new.
- **API:** getAddresses on focus; removeAddress on delete.
- **Data:** addressData from API; currentAddress from Redux; setAddress on select.

### 6.16 AddAnAddress

- **Purpose:** Form to add address (first/last name, phone, address lines, city, country, postal code, given name).
- **API:** addAddress(payload); on success snackbar and goBack.

### 6.17 PayMentMethod

- **Purpose:** Card form (number, expiry, CVV, name) and “Pay 29$” / Google Pay / Apple Pay (UI only). Optional “Save for Next Payment” checkbox.
- **Navigation:** Back (Ebook vs Shop); “Pay 29$” → PurchaseSuccessful (with or without isEBook). No real payment integration.

### 6.18 MyOrders

- **Purpose:** List orders (currently mock data in state).
- **Navigation:** Back, ContactUs (“Help?”).

### 6.19 PurchaseSuccessful, ContactUs, WaitLoader, CartDetail, EBookPurchase, EditPhotos

- **PurchaseSuccessful:** Shown after “Pay 29$”; route params can include isEBook.
- **ContactUs:** Linked from Profile; no API in reviewed code.
- **WaitLoader:** Placeholder loader screen.
- **CartDetail:** Local cart detail state; quantity +/-; navigates to Addresses/BottomTab.
- **EBookPurchase / EditPhotos:** Present in stack; not fully analyzed here but follow same patterns (navigation, optional API).

---

## 7. State Management Deep Dive

### Global State (Redux)

- **user (userSlice):**  
  - `user`, `token`, `socialLogin`, `savedChats`, `cartChats`, `currentAddress`.  
  - Actions: onLogin, onUpdate, setAddress, enableSocialLogin, saveChat, deleteChat, addCart, setCart, removeCart, onLogout.  
  - Persisted (except not in blacklist).
- **chats (chatSlice):**  
  - `currentChat`, `chatMessages`, draftChats (in initial state), loading flags.  
  - Actions: saveCurrentChat, saveCurrentChatMessages, loadSavedChat, clearCurrentChat.  
  - Persisted.
- **snackbar (snackbarSlice):**  
  - `snackbarVisible`, `snackbarMessage`, `navigateTo`, `dateModifierVisible`.  
  - Blacklisted in persist (not persisted).

### Data Flow

- Login → dispatch onLogin → user + token in store → persisted.  
- Chat Done → createChat/uploadChatMedia/bulkMessages → dispatch saveCurrentChat, saveCurrentChatMessages, saveChat → savedChats and currentChat/chatMessages updated.  
- Cart: addCart/removeCart/setCart from CartDetail/BookList/CartProducts.  
- Address: setAddress when user selects in Addresses; getAddresses can set first address as current if none.

### Re-renders and Memoization

- **LogIn, LostYourPassword:** Wrapped in `React.memo`.
- **Chat:** `React.memo`; `renderChats` for FlashList is `useCallback(..., [bookConfig])`.
- **BookList:** `shuffledMessages` and `spreads` are `useMemo`; usePaginatedMessages uses `useCallback` for `paginate` and ref for previous messages to avoid unnecessary re-pagination.

### Async State

- No global loading/error state; each screen keeps local `loading`/error and shows Alert or button animating. API errors are caught in screen and displayed there.

---

## 8. Authentication Flow

- **Login:** Email/password → POST user/login → store user + token; reset to BottomTab. Google: signIn only (no backend exchange in code).
- **Register:** Firebase createUserWithEmailAndPassword → success → reset to BottomTab (no backend token). Commented block shows intended backend register + onLogin flow.
- **Forgot password:** forgotPassword → OTP modal → vertifyOtp → CreateNewPassword → resetPassword → reset to LogIn.
- **Token storage:** Only in Redux (and thus in AsyncStorage via persist). No Keychain/Keystore.
- **Token refresh:** None. 401 is not handled with refresh or redirect.
- **Auto logout:** None. User stays “logged in” until they press Log out.
- **Protected routes:** No route guard. Splash sends unauthenticated users to LogIn; once on BottomTab, all tabs are reachable. API interceptor always sends Bearer token (may be undefined if user signed up only with Firebase).

**Weaknesses:** Google Sign-In not wired to backend; CreateAccount doesn’t set backend token; token in AsyncStorage (not hardware-backed); no refresh or 401 → LogIn flow.

---

## 9. API Layer Breakdown

- **Definition:**  
  - `app/services/client.ts`: Axios instance with `baseURL: Config.baseUrl`, JSON headers, request interceptor (adds `Authorization: Bearer ${store.getState().user.token}`, console.log), response interceptor (401 and others → reject).  
  - `app/services/calls.ts`: register, login, forgotPassword, vertifyOtp, resetPassword, updateProfile (FormData), uploadContent, getAddresses, removeAddress, addAddress.  
  - `app/services/chatApi.ts`: createChat (GET `chats` with params — likely bug), getChat(GET), uploadChatMedia (POST FormData), bulkMessages (POST).
- **Request lifecycle:** Component/service calls function → Axios sends request → interceptor adds token → backend responds → interceptor returns response or rejects → caller handles in try/catch.
- **Error handling:** No global handler; each screen uses Alert or snackbar from `err.response?.data?.error`. No retry or timeout configuration shown.

---

## 10. Business Logic

- **Book types:** Standard vs Square vs Open from bookspecs title (BookList getBookType).
- **Draft vs cart:** savedChats = drafts (saveChat/deleteChat); cartChats = cart (addCart/removeCart/setCart). Cart items need details.bookSpecs for CartProducts to show and price.
- **Pagination (BookList):** usePaginatedMessages measures text (RNTextSize), fixed heights for image/video/audio; fills pages by height; BANNER_HEIGHT and margins from constants. AIPaginationService (aiPaginationService.ts) is an alternative with strategies (minimal, compact, large_content, bulk) and fill targets (e.g. 80%).
- **Chat parsing:** Regex parsing in import-chat-helpers (parseChat); or Groq in useChatParser (chunked, NDJSON, media matching). Only text/image/video/audio kept.
- **Cart pricing:** Subtotal from bookSpecs.price * quantity + EBOOK_PRICE if eBookCheckBox + BOOK_COVER_PRICE if bookCoverCheckBox; discount sample 1.5 (RedeemPress).
- **Address:** First address from getAddresses set as current if currentAddress null.
- **CreateAccount:** Firebase-only path doesn’t set backend user/token — backend may expect separate registration or link.

---

## 11. Performance and Optimization

- **FlashList (Chat):** Used for chat messages with `getItemType` by messageType and `estimatedItemSize={60}`; `renderItem` memoized with useCallback(..., [bookConfig]).
- **BookList:** usePaginatedMessages runs async (RNTextSize.measure per text message); memoized messages and spreads; FlatList for chat list.
- **useChatParser:** Chunked Groq requests (~8KB); buffer flushed every 300ms to avoid huge single setState.
- **Redux:** Persist blacklists snackbar to avoid persisting transient UI. Serializable check ignores persist actions.
- **No code splitting or lazy loading of screens** in navigation (all screens in one stack). No explicit API response caching; cart and savedChats are the effective “cache” in Redux.

---

## 12. Security Analysis

- **Sensitive data:** Token and user stored in Redux → AsyncStorage (redux-persist). Not in a secure enclave (e.g. Keychain). .env holds GROQ_API_KEY and googleLoginKey; Babel injects at build time so keys are in client bundle — risky for production.
- **HTTPS:** baseUrl should be https in production; not enforced in code.
- **Secrets:** .env should be gitignored; env.d.ts only types. No server-side proxy for Groq; key exposure if app is decompiled.
- **Recommendations:** Use secure storage for token; move Groq parsing to backend; keep API keys out of client; enforce HTTPS and certificate pinning if needed.

---

## 13. Environment Configuration

- **.env:** GROQ_API_KEY, baseUrl, googleLoginKey (with placeholders).
- **Loading:** react-native-dotenv in babel.config.js, moduleName `@env`, path `.env`. config.ts imports from `@env` and exports Config with fallbacks to empty string.
- **env.d.ts:** Declares `@env` module (GROQ_API_KEY, baseUrl, googleLoginKey).
- **Build/release:** No separate dev/prod env files in repo; switching env would require different .env or build-time vars.

---

## 14. Possible Improvements

- **Architecture:** Use backend for CreateAccount and Google Sign-In; add auth guard or token validation on app start; centralize 401 → logout and redirect to LogIn.
- **API:** Fix createChat to POST if backend expects it; add timeout and optional retry in client; consider typed API layer (e.g. OpenAPI client).
- **Security:** Store token in secure storage; move Groq parsing to backend; remove API keys from client or use backend proxy.
- **State:** Consider normalizing savedChats/cartChats by id to avoid duplicates and simplify updates; add loading/error slices if you want global indicators.
- **Performance:** Lazy-load heavy screens (e.g. BookList, Chat); consider memoizing more list items; add error boundaries.
- **UX:** Handle 401 globally (e.g. clear user and redirect to LogIn); complete Google Sign-In flow; add pull-to-refresh or sync for drafts/cart if backend supports it.
- **Code quality:** Remove or gate console.log in client.ts; fix CreateNewPassword navigation (pass object with email); unify error messages and add i18n if needed.
- **Testing:** Add unit tests for slices and useChatParser; integration tests for login and chat save flow.

---

This concludes the technical documentation. Every section is based on the current codebase behavior and file structure as analyzed.
