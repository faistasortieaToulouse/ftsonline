import { Header } from "@/components/Header";
import Link from "next/link";
import { ArrowLeft, BookUser } from "lucide-react";

export default function TermsOfUsePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-8 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Retour à l'accueil
          </Link>
          <div className="max-w-4xl mx-auto prose dark:prose-invert">
            <div className="flex items-center gap-4 not-prose mb-8">
              <BookUser className="h-8 w-8 text-primary" />
              <h1 className="font-headline text-3xl md:text-4xl font-bold text-foreground">
                Charte d'utilisation
              </h1>
            </div>
            
            <p className="lead">Règles de bonne conduite et conditions d'utilisation de notre service.</p>

            <h2>Bienvenue sur Fais ta sortie à Toulouse !</h2>
            <p>Pour que notre communauté reste un espace convivial, sûr et respectueux, nous vous demandons de lire et d'accepter les règles suivantes.</p>
            
            <h2>1. Respect et bienveillance</h2>
            <p>Chaque membre s'engage à faire preuve de courtoisie, de respect et de tolérance envers les autres utilisateurs. Les propos haineux, discriminatoires, injurieux, ou toute forme de harcèlement sont strictement interdits et entraîneront une suspension immédiate du compte.</p>

            <h2>2. Sécurité et données personnelles</h2>
            <p>Ne sharez jamais d'informations personnelles sensibles (numéro de téléphone, adresse exacte, informations bancaires) dans les espaces publics de l'application. Utilisez la messagerie privée pour des échanges plus personnels, mais restez vigilant.</p>

            <h2>3. Contenu des publications</h2>
            <p>Toute publication (annonces, discussions, événements) doit être légale et conforme aux bonnes mœurs. Les contenus à caractère pornographique, violent, illégal ou faisant l'apologie d'activités illicites sont proscrits.</p>

            <h2>4. Interdiction des sorties de rencontre amoureuse ou entre célibataires</h2>
            <p>Etant donné les problèmes provoqués par les évènements de rencontre, les sorties de rencontre sont prohibées sur notre application. Fais ta sortie à Toulouse est une plateforme dédiée aux sorties amicales et à l'entraide. Les événements organisés dans le but explicite de faire des rencontres amoureuses ou "dating" ne sont pas autorisés. Toute publication de ce type sera supprimée. Tout contrevenant pourra faire l'objet d'une suspension de son compte.</p>

            <h2>5. Signalements</h2>
            <p>Si vous constatez un comportement ou un contenu qui enfreint cette charte, utilisez les outils de signalement mis à votre disposition. Notre équipe de modération examinera chaque signalement avec attention.</p>

            <h2>6. Responsabilité</h2>
            <p>Les organisateurs de sorties sont responsables du bon déroulement de leurs événements. Fais ta sortie à Toulouse agit comme une plateforme de mise en relation et ne peut être tenu responsable des incidents survenant lors des activités organisées par ses membres.</p>

            <h2>7. Sorties payantes</h2>
            <p>En ce qui concerne les sorties payantes ou qui contiennent des activités payantes ou vente de produits à côté, elles doivent être signalées au moins dans la description de la sortie. La transparence est essentielle pour que les membres puissent participer en toute connaissance de cause.</p>

            <h2>8. Concurrence</h2>
            <p>L'utilisation de cette application ne doit pas donner lieu à la promotion d'une autre application de même type que celle-ci.</p>

            <h2>Acceptation</h2>
            <p>En vous inscrivant, vous confirmez avoir lu et accepté l'ensemble de cette charte. Merci de contribuer à faire de Fais ta sortie à Toulouse un espace positif et accueillant pour tous !</p>
          </div>
        </div>
      </main>
    </div>
  );
}
