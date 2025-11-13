import { Header } from "@/components/Header";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function PrivacyPolicyPage() {
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
              <ShieldCheck className="h-8 w-8 text-primary" />
              <h1 className="font-headline text-3xl md:text-4xl font-bold text-foreground">
                Politique de Confidentialité
              </h1>
            </div>
            
            <p className="lead">Informations sur la collecte et l'utilisation de vos données.</p>
            
            <h2>1. Introduction</h2>
            <p>
              Fais ta sortie à Toulouse (ci-après « l'Application » ou « Nous »), éditée par l'association <strong>Happy People 31</strong>, basée au 26, avenue de la Colonne à Toulouse, s'engage à protéger la confidentialité des utilisateurs. Cette politique de confidentialité détaille les types d'informations que nous collectons via l'Application, la manière dont nous les utilisons et les droits des utilisateurs concernant ces informations.
            </p>

            <h2>2. Données Collectées</h2>
            <h3>2.1. Informations Fournies par l'Utilisateur</h3>
            <ul>
                <li><strong>Données d'identité et de contact</strong> (lorsque l'utilisateur choisit de créer un compte) : Nom d'utilisateur, adresse e-mail, mot de passe chiffré.</li>
                <li><strong>Contenu Utilisateur</strong> (le cas échéant : messages dans les discussions, commentaires sur les sorties, descriptions de profils) : Textes, photos, ou autres contenus que vous téléchargez ou créez dans l'Application.</li>
            </ul>

            <h3>2.2. Informations Collectées Automatiquement</h3>
            <ul>
                <li><strong>Données d'utilisation :</strong> Informations sur la manière dont vous interagissez avec l'Application (pages vues, fonctionnalités utilisées, fréquence d'accès, etc.).</li>
                <li><strong>Données techniques :</strong> Adresse IP, type d'appareil mobile, système d'exploitation, identifiants uniques de l'appareil (tels que : IDFA pour iOS, Android ID pour Android).</li>
                <li><strong>Données de localisation</strong> (si l'utilisateur a donné son consentement explicite, par exemple via l'activation du GPS de son appareil) : Localisation géographique précise via GPS ou moins précise via l'adresse IP.</li>
                <li><strong>Cookies et technologies similaires :</strong> Utilisés pour améliorer l'expérience utilisateur et analyser l'utilisation de l'Application.</li>
            </ul>

            <h2>3. Utilisation des Données</h2>
            <p>Nous utilisons les données collectées pour les finalités suivantes :</p>
            <ul>
                <li><strong>Fourniture de Services :</strong> Pour exploiter, maintenir, fournir et améliorer les fonctionnalités de l'Application.</li>
                <li><strong>Communication :</strong> Pour répondre à vos demandes de support, vous envoyer des notifications liées au service, ou des communications marketing (avec votre consentement).</li>
                <li><strong>Analyse et Amélioration :</strong> Pour surveiller les métriques d'utilisation, diagnostiquer les problèmes techniques et améliorer l'expérience utilisateur.</li>
                <li><strong>Sécurité et Conformité Légale :</strong> Pour prévenir la fraude, protéger la sécurité de l'Application et se conformer aux obligations légales.</li>
            </ul>

            <h2>4. Partage des Données</h2>
            <p>Nous ne vendons ni ne louons vos données personnelles à des tiers. Nous pouvons partager vos informations avec :</p>
            <ul>
                <li><strong>Prestataires de Services Tiers :</strong> Entreprises externes qui nous aident à exploiter l'Application (hébergement de données, services d'analyse, marketing). Ces tiers sont contractuellement obligés de protéger vos données.</li>
                <li><strong>Obligations Légales :</strong> Si nous y sommes contraints par la loi ou par une procédure judiciaire valide (par exemple, un mandat de perquisition ou une ordonnance d'un tribunal).</li>
                <li><strong>Transferts d'Entreprise :</strong> Dans le cadre d'une fusion, acquisition, ou vente d'actifs, vos données pourraient être transférées à l'entité acquéreuse.</li>
            </ul>

            <h2>5. Durée de Conservation des Données</h2>
            <p>
              Nous conservons vos informations personnelles aussi longtemps que nécessaire pour vous fournir le service, et pour nous conformer à nos obligations légales, résoudre les litiges et appliquer nos politiques.
            </p>

            <h2>6. Vos Droits d'Utilisateur</h2>
            <p>Conformément à la réglementation applicable (comme le RGPD), vous disposez des droits suivants :</p>
            <ul>
                <li><strong>Droit d'accès :</strong> Obtenir la confirmation que vos données sont traitées et, le cas échéant, y accéder.</li>
                <li><strong>Droit de rectification :</strong> Demander la correction de données inexactes.</li>
                <li><strong>Droit à l'effacement :</strong> Demander la suppression de vos données personnelles (sous certaines conditions).</li>
                <li><strong>Droit d'opposition :</strong> Vous opposer au traitement de vos données pour certaines finalités, comme le marketing direct.</li>
            </ul>
            <p>Pour exercer ces droits, veuillez nous contacter à l'adresse fournie dans la section 7.</p>

            <h2>7. Nous Contacter</h2>
            <p>
              Si vous avez des questions concernant cette politique de confidentialité, vous pouvez nous contacter à : tolosa31@free.fr.
            </p>

            <h2>8. Modifications de la Politique de Confidentialité</h2>
            <p>
              Nous pourrons mettre à jour cette politique de confidentialité de temps à autre. Nous vous informerons de toute modification en publiant la nouvelle politique sur cette page et en changeant la date d'entrée en vigueur ci-dessous.
            </p>
            <p><em>Date d'entrée en vigueur : 12 novembre 2025</em></p>

          </div>
        </div>
      </main>
    </div>
  );
}
