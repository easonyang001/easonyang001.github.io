import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./layouts/Layout.tsx";

const HomePage = lazy(() => import("./pages/HomePage.tsx"));
const AboutPage = lazy(() => import("./pages/AboutPage.tsx"));
const ResearchPage = lazy(() => import("./pages/research/ResearchPage.tsx"));
const ResearchDetailPage = lazy(() => import("./pages/research/ResearchDetailPage.tsx"));
const ProjectsPage = lazy(() => import("./pages/projects/ProjectsPage.tsx"));
const ProjectDetailPage = lazy(() => import("./pages/projects/ProjectDetailPage.tsx"));
const PublicationsPage = lazy(() => import("./pages/PublicationsPage.tsx"));
const PeoplePage = lazy(() => import("./pages/people/PeoplePage.tsx"));
const PersonDetailPage = lazy(() => import("./pages/people/PersonDetailPage.tsx"));
const NewsPage = lazy(() => import("./pages/NewsPage.tsx"));
const NewsDetailPage = lazy(() => import("./pages/NewsDetailPage.tsx"));
const DigestPage = lazy(() => import("./pages/DigestPage.tsx"));
const ContactPage = lazy(() => import("./pages/ContactPage.tsx"));
const EducationPage = lazy(() => import("./pages/education/EducationPage.tsx"));
const EducationDetailPage = lazy(() => import("./pages/education/EducationDetailPage.tsx"));
const OpenSourcePage = lazy(() => import("./pages/OpenSourcePage.tsx"));
const FontLabPage = lazy(() => import("./pages/FontLabPage.tsx"));
const LabPage = lazy(() => import("./pages/lab/LabPage.tsx"));
const BlochSpherePage = lazy(() => import("./pages/lab/BlochSpherePage.tsx"));
const CircuitPage = lazy(() => import("./pages/lab/CircuitPage.tsx"));
const VQCPage = lazy(() => import("./pages/lab/VQCPage.tsx"));
const VQEH2Page = lazy(() => import("./pages/lab/VQEH2Page.tsx"));
const SystemRecoveryPage = lazy(() => import("./pages/lab/SystemRecoveryPage.tsx"));
const Lab01FirstPersonPage = lazy(() => import("./pages/lab/Lab01FirstPersonPage.tsx"));
const QuboPage = lazy(() => import("./pages/lab/QuboPage.tsx"));
const AnnealingPage = lazy(() => import("./pages/lab/AnnealingPage.tsx"));
const QuantumKernelPage = lazy(() => import("./pages/lab/QuantumKernelPage.tsx"));
const BarrenPlateauPage = lazy(() => import("./pages/lab/BarrenPlateauPage.tsx"));
const LabToolPage = lazy(() => import("./pages/lab/LabToolPage.tsx"));
const AdminPage = lazy(() => import("./pages/AdminPage.tsx"));
const SolutionsPage = lazy(() => import("./pages/solutions/SolutionsPage.tsx"));
const SolutionDetailPage = lazy(() => import("./pages/solutions/SolutionDetailPage.tsx"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage.tsx"));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="research" element={<ResearchPage />} />
            <Route path="research/:slug" element={<ResearchDetailPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/:slug" element={<ProjectDetailPage />} />
            <Route path="publications" element={<PublicationsPage />} />
            <Route path="people" element={<PeoplePage />} />
            <Route path="people/:slug" element={<PersonDetailPage />} />
            <Route path="news" element={<NewsPage />} />
            <Route path="news/:slug" element={<NewsDetailPage />} />
            <Route path="digest" element={<DigestPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="education" element={<EducationPage />} />
            <Route path="education/:slug" element={<EducationDetailPage />} />
            <Route path="opensource" element={<OpenSourcePage />} />
            <Route path="fonts" element={<FontLabPage />} />
            <Route path="lab" element={<LabPage />} />
            <Route path="lab/bloch-sphere" element={<BlochSpherePage />} />
            <Route path="lab/circuit" element={<CircuitPage />} />
            <Route path="lab/vqc" element={<VQCPage />} />
            <Route path="lab/vqe-h2" element={<VQEH2Page />} />
            <Route path="lab/system-recovery" element={<SystemRecoveryPage />} />
            <Route path="lab/lab01-first-person" element={<Lab01FirstPersonPage />} />
            <Route path="lab/qubo" element={<QuboPage />} />
            <Route path="lab/annealing" element={<AnnealingPage />} />
            <Route path="lab/quantum-kernel" element={<QuantumKernelPage />} />
            <Route path="lab/barren-plateau" element={<BarrenPlateauPage />} />
            <Route path="lab/:toolSlug" element={<LabToolPage />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="solutions" element={<SolutionsPage />} />
            <Route path="solutions/:slug" element={<SolutionDetailPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
