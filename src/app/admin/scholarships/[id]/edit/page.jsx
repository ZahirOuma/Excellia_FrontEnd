"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

const EditScholarshipPage = ({ params }) => {
  const router = useRouter();
  const { id } = params;
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    university: "",
    description: "",
    anneeAcademique: "",
    amount: "",
    duration: "",
    places: "",
    startDate: "",
    deadline: "",
    requiredDocuments: "",
    eligibilityCriteria: "",
    pdfLink: null,
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Fonction pour récupérer les détails de la bourse depuis l'API
  useEffect(() => {
    const fetchScholarshipDetails = async () => {
      setFetchLoading(true);
      try {
        // Pour la version statique, on utilise les données du tableau
        const staticScholarship = {
          id: parseInt(id),
          title: "Bourse d'excellence TEST",
          university: "Université Mohammed VI",
          description: "Description de la bourse d'excellence",
          anneeAcademique: "2023-2024",
          amount: 5000,
          duration: 10,
          places: 20,
          startDate: "2023-09-01",
          deadline: "2023-10-31",
          requiredDocuments: "CV, relevé de notes, lettre de motivation",
          eligibilityCriteria: "Moyenne générale supérieure à 14/20",
        };
        
        // Mise à jour du formulaire avec les données récupérées
        setFormData({
          title: staticScholarship.title,
          university: staticScholarship.university || "",
          description: staticScholarship.description || "",
          anneeAcademique: staticScholarship.anneeAcademique,
          amount: staticScholarship.amount,
          duration: staticScholarship.duration,
          places: staticScholarship.places,
          startDate: staticScholarship.startDate,
          deadline: staticScholarship.deadline,
          requiredDocuments: staticScholarship.requiredDocuments || "",
          eligibilityCriteria: staticScholarship.eligibilityCriteria || "",
          pdfLink: null,
        });
        
        // Pour la version dynamique, décommentez le code ci-dessous :
        /*
        const response = await fetch(`http://localhost:8080/api/scholarships/${id}`);
        if (!response.ok) {
          throw new Error(`Erreur: ${response.status}`);
        }
        const data = await response.json();
        
        // Mise à jour du formulaire avec les données récupérées
        setFormData({
          title: data.title,
          university: data.university || "",
          description: data.description || "",
          anneeAcademique: data.anneeAcademique,
          amount: data.amount,
          duration: data.duration,
          places: data.places,
          startDate: data.startDate,
          deadline: data.deadline,
          requiredDocuments: data.requiredDocuments || "",
          eligibilityCriteria: data.eligibilityCriteria || "",
          pdfLink: null,
        });
        */
      } catch (err) {
        console.error("Erreur lors du chargement des détails de la bourse:", err);
        setError("Impossible de charger les détails de la bourse. Veuillez réessayer plus tard.");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchScholarshipDetails();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === "file") {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Create FormData object to handle file upload
      const formDataToSend = new FormData();
      
      // Add text fields to FormData
      Object.keys(formData).forEach(key => {
        if (key !== "pdfLink") {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Add file if it exists
      if (formData.pdfLink) {
        formDataToSend.append("pdfLink", formData.pdfLink);
      }

      // Pour la version statique, on simule juste une mise à jour réussie
      setTimeout(() => {
        setSuccessMessage("Bourse modifiée avec succès!");
        setLoading(false);
        // Redirection après 2 secondes
        setTimeout(() => {
          router.push("/admin/scholarships");
        }, 2000);
      }, 1000);

      // Pour la version dynamique, décommentez le code ci-dessous :
      /*
      const response = await fetch(`http://localhost:8080/api/scholarships/${id}`, {
        method: "PUT",
        body: formDataToSend,
        // Don't set Content-Type header when sending FormData
        // The browser will set it automatically with the correct boundary
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Erreur: ${response.status}`);
      }

      const result = await response.json();
      console.log("Bourse modifiée avec succès:", result);
      setSuccessMessage("Bourse modifiée avec succès!");
      
      // Redirection après 2 secondes
      setTimeout(() => {
        router.push("/admin/scholarships");
      }, 2000);
      */
    } catch (err) {
      console.error("Erreur lors de la modification de la bourse:", err);
      setError(err.message || "Une erreur est survenue lors de la modification de la bourse");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Modification d'une bourse</h1>
        <div className={styles.formContainer}>
          <div className={styles.loadingMessage}>Chargement des données de la bourse...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Modifier une bourse</h1>
      
      <div className={styles.formContainer}>
        {error && <div className={styles.errorMessage}>{error}</div>}
        {successMessage && <div className={styles.successMessage}>{successMessage}</div>}
        
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Titre de la bourse */}
          <div className={styles.inputGroup}>
            <label htmlFor="title" className={styles.label}>Nom de la bourse :</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="Entrez le nom de la bourse"
            />
          </div>
          
          {/* Université */}
          <div className={styles.inputGroup}>
            <label htmlFor="university" className={styles.label}>Université :</label>
            <input
              type="text"
              id="university"
              name="university"
              value={formData.university}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="Entrez le nom de l'université"
            />
          </div>
          
          {/* Description */}
          <div className={styles.inputGroup}>
            <label htmlFor="description" className={styles.label}>Description :</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className={styles.textarea}
              placeholder="Décrivez la bourse en quelques lignes"
              rows="3"
            />
          </div>
          
          {/* Année académique */}
          <div className={styles.inputGroup}>
            <label htmlFor="anneeAcademique" className={styles.label}>Année académique :</label>
            <input
              type="text"
              id="anneeAcademique"
              name="anneeAcademique"
              value={formData.anneeAcademique}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="Ex: 2024-2025"
            />
          </div>
          
          {/* Montant de la bourse */}
          <div className={styles.inputGroup}>
            <label htmlFor="amount" className={styles.label}>Montant de la bourse (MAD) :</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="Entrez le montant de la bourse"
            />
          </div>
          
          {/* Durée de la bourse */}
          <div className={styles.inputGroup}>
            <label htmlFor="duration" className={styles.label}>Durée de la bourse (mois) :</label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="Entrez la durée en mois"
            />
          </div>
          
          {/* Nombre de places */}
          <div className={styles.inputGroup}>
            <label htmlFor="places" className={styles.label}>Nombre de places :</label>
            <input
              type="number"
              id="places"
              name="places"
              value={formData.places}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="Entrez le nombre de places disponibles"
            />
          </div>
          
          {/* Dates de candidature */}
          <div className={styles.rowGroup}>
            <div className={styles.inputGroup}>
              <label htmlFor="startDate" className={styles.label}>Date de début :</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className={styles.input}
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label htmlFor="deadline" className={styles.label}>Date de fin :</label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                required
                className={styles.input}
              />
            </div>
          </div>
          
          {/* Documents requis */}
          <div className={styles.inputGroup}>
            <label htmlFor="requiredDocuments" className={styles.label}>Documents requis :</label>
            <textarea
              id="requiredDocuments"
              name="requiredDocuments"
              value={formData.requiredDocuments}
              onChange={handleChange}
              required
              className={styles.textarea}
              placeholder="Listez les documents requis"
              rows="4"
            />
          </div>
          
          {/* Critères d'éligibilité */}
          <div className={styles.inputGroup}>
            <label htmlFor="eligibilityCriteria" className={styles.label}>Critères d'éligibilité :</label>
            <textarea
              id="eligibilityCriteria"
              name="eligibilityCriteria"
              value={formData.eligibilityCriteria}
              onChange={handleChange}
              required
              className={styles.textarea}
              placeholder="Décrivez les critères d'éligibilité"
              rows="4"
            />
          </div>
          
          {/* PDF pour les détails */}
          <div className={styles.inputGroup}>
            <label htmlFor="pdfLink" className={styles.label}>Fichier PDF des détails :</label>
            <input
              type="file"
              id="pdfLink"
              name="pdfLink"
              onChange={handleChange}
              accept=".pdf"
              className={styles.fileInput}
            />
            {!formData.pdfLink && (
              <div className={styles.helpText}>
                Laissez vide pour conserver le fichier existant. Choisissez un nouveau fichier pour le remplacer.
              </div>
            )}
          </div>
          
          {/* Boutons */}
          <div className={styles.buttonGroup}>
            <button
              type="submit"
              className={loading ? styles.submitButtonDisabled : styles.submitButton}
              disabled={loading}
            >
              {loading ? "Traitement en cours..." : "Mettre à jour"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/scholarships")}
              className={loading ? styles.cancelButtonDisabled : styles.cancelButton}
              disabled={loading}
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditScholarshipPage;