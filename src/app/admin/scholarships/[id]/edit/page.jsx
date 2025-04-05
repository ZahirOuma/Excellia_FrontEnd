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
    amount: "",
    duration: "",
    places: "",
    startDate: "",
    deadline: "",
    requiredDocuments: "",
    eligibilityCriteria: "",
    pdfLink: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Fonction pour récupérer les détails de la bourse depuis l'API
  useEffect(() => {
    const fetchScholarshipDetails = async () => {
      setFetchLoading(true);
      try {
        // Utiliser le proxy API pour récupérer les données
        const response = await fetch(`/api/proxy/gestion-bourse-condidature-service/api/bourses/${id}`);
        if (!response.ok) {
          throw new Error(`Erreur: ${response.status}`);
        }
        const data = await response.json();
        
        // Traitement des critères d'éligibilité
        let formattedEligibilityCriteria = data.eligibilityCriteria;
        if (Array.isArray(data.eligibilityCriteria)) {
          formattedEligibilityCriteria = data.eligibilityCriteria
            .map(criterion => `${criterion.name}: ${criterion.value}`)
            .join('\n');
        }
        
        // Traitement des documents requis
        let formattedRequiredDocuments = data.requiredDocuments;
        if (Array.isArray(data.requiredDocuments)) {
          formattedRequiredDocuments = data.requiredDocuments.join('\n');
        }
        
        // Mise à jour du formulaire avec les données récupérées
        setFormData({
          id: data.id,
          title: data.title,
          university: data.university || "",
          description: data.description || "",
          amount: data.amount,
          duration: data.duration,
          places: data.places,
          startDate: data.startDate,
          deadline: data.deadline,
          requiredDocuments: formattedRequiredDocuments || "",
          eligibilityCriteria: formattedEligibilityCriteria || "",
          pdfLink: data.pdfLink || "",
        });
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
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear validation error for this field when user types
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const requiredFields = [
      "title", "university", "description", "amount", 
      "duration", "places", "startDate", "deadline", 
      "requiredDocuments", "eligibilityCriteria"
    ];
    
    requiredFields.forEach(field => {
      if (!formData[field]) {
        errors[field] = "Ce champ est obligatoire";
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    const isValid = validateForm();
    if (!isValid) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // S'assurer que ces valeurs sont bien des nombres
      const places = parseInt(formData.places) || 0;
      const amount = parseFloat(formData.amount) || 0;
      const duration = parseInt(formData.duration) || 0;
      
      // Formater les critères d'éligibilité comme dans la page d'ajout
      const eligibilityCriteriaArray = formData.eligibilityCriteria
        .split("\n")
        .filter(item => item.trim())
        .map(item => {
          if (item.includes(":")) {
            const [name, value] = item.split(":");
            return {
              name: name ? name.trim() : "",
              value: value ? value.trim() : ""
            };
          } else {
            return {
              name: item.trim(),
              value: ""
            };
          }
        });
      
      // Formater les documents requis comme dans la page d'ajout
      const requiredDocumentsArray = formData.requiredDocuments
        .split("\n")
        .filter(item => item.trim());

      // Construire l'objet à envoyer
      const scholarshipData = {
        id: formData.id,
        title: formData.title,
        university: formData.university,
        description: formData.description,
        places: places,
        startDate: formData.startDate,
        deadline: formData.deadline,
        amount: amount,
        duration: duration,
        pdfLink: formData.pdfLink,
        eligibilityCriteria: eligibilityCriteriaArray,
        requiredDocuments: requiredDocumentsArray,
      };

      // Afficher les données pour déboguer
      console.log("Données envoyées:", JSON.stringify(scholarshipData, null, 2));

      // Envoyer la requête via le proxy API
      const response = await fetch(`/api/proxy/gestion-bourse-condidature-service/api/bourses/${id}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scholarshipData),
      });

      // Récupérer le texte de la réponse pour voir les erreurs éventuelles
      const responseText = await response.text();
      console.log("Réponse du serveur:", responseText);

      if (!response.ok) {
        try {
          // Essayer de parser en JSON si possible
          const errorData = JSON.parse(responseText);
          throw new Error(errorData?.message || `Erreur: ${response.status}`);
        } catch (e) {
          // Si ce n'est pas du JSON valide, utiliser le texte brut
          throw new Error(`Erreur ${response.status}: ${responseText}`);
        }
      }

      setSuccessMessage("Bourse modifiée avec succès!");
      
      // Redirection après 2 secondes
      setTimeout(() => {
        router.push("/admin/scholarships");
      }, 2000);
    } catch (err) {
      console.error("Erreur lors de la modification de la bourse:", err);
      setError(err.message || "Une erreur est survenue lors de la modification de la bourse");
    } finally {
      setLoading(false);
    }
  };

  // Style pour le message d'erreur de validation
  const errorMessageStyle = {
    color: "red",
    fontSize: "0.8rem",
    marginTop: "5px",
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
            <label htmlFor="title" className={styles.label}>
              Nom de la bourse : <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`${styles.input} ${validationErrors.title ? styles.inputError : ""}`}
              placeholder="Entrez le nom de la bourse"
            />
            {validationErrors.title && <p style={errorMessageStyle}>{validationErrors.title}</p>}
          </div>
          
          {/* Université */}
          <div className={styles.inputGroup}>
            <label htmlFor="university" className={styles.label}>
              Université : <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              id="university"
              name="university"
              value={formData.university}
              onChange={handleChange}
              className={`${styles.input} ${validationErrors.university ? styles.inputError : ""}`}
              placeholder="Entrez le nom de l'université"
            />
            {validationErrors.university && <p style={errorMessageStyle}>{validationErrors.university}</p>}
          </div>
          
          {/* Description */}
          <div className={styles.inputGroup}>
            <label htmlFor="description" className={styles.label}>
              Description : <span style={{ color: "red" }}>*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`${styles.textarea} ${validationErrors.description ? styles.inputError : ""}`}
              placeholder="Décrivez la bourse en quelques lignes"
              rows="3"
            />
            {validationErrors.description && <p style={errorMessageStyle}>{validationErrors.description}</p>}
          </div>
          
          {/* Montant de la bourse */}
          <div className={styles.inputGroup}>
            <label htmlFor="amount" className={styles.label}>
              Montant de la bourse (MAD) : <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className={`${styles.input} ${validationErrors.amount ? styles.inputError : ""}`}
              placeholder="Entrez le montant de la bourse"
            />
            {validationErrors.amount && <p style={errorMessageStyle}>{validationErrors.amount}</p>}
          </div>
          
          {/* Durée de la bourse */}
          <div className={styles.inputGroup}>
            <label htmlFor="duration" className={styles.label}>
              Durée de la bourse (mois) : <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className={`${styles.input} ${validationErrors.duration ? styles.inputError : ""}`}
              placeholder="Entrez la durée en mois"
            />
            {validationErrors.duration && <p style={errorMessageStyle}>{validationErrors.duration}</p>}
          </div>
          
          {/* Nombre de places */}
          <div className={styles.inputGroup}>
            <label htmlFor="places" className={styles.label}>
              Nombre de places : <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="number"
              id="places"
              name="places"
              value={formData.places}
              onChange={handleChange}
              className={`${styles.input} ${validationErrors.places ? styles.inputError : ""}`}
              placeholder="Entrez le nombre de places disponibles"
            />
            {validationErrors.places && <p style={errorMessageStyle}>{validationErrors.places}</p>}
          </div>
          
          {/* Dates de candidature */}
          <div className={styles.rowGroup}>
            <div className={styles.inputGroup}>
              <label htmlFor="startDate" className={styles.label}>
                Date de début : <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={`${styles.input} ${validationErrors.startDate ? styles.inputError : ""}`}
              />
              {validationErrors.startDate && <p style={errorMessageStyle}>{validationErrors.startDate}</p>}
            </div>
            
            <div className={styles.inputGroup}>
              <label htmlFor="deadline" className={styles.label}>
                Date de fin : <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className={`${styles.input} ${validationErrors.deadline ? styles.inputError : ""}`}
              />
              {validationErrors.deadline && <p style={errorMessageStyle}>{validationErrors.deadline}</p>}
            </div>
          </div>
          
          {/* Documents requis */}
          <div className={styles.inputGroup}>
            <label htmlFor="requiredDocuments" className={styles.label}>
              Documents requis : <span style={{ color: "red" }}>*</span>
            </label>
            <textarea
              id="requiredDocuments"
              name="requiredDocuments"
              value={formData.requiredDocuments}
              onChange={handleChange}
              className={`${styles.textarea} ${validationErrors.requiredDocuments ? styles.inputError : ""}`}
              placeholder="Listez les documents requis (un par ligne)"
              rows="4"
            />
            <div className={styles.helpText}>
              Veuillez entrer un document par ligne
            </div>
            {validationErrors.requiredDocuments && <p style={errorMessageStyle}>{validationErrors.requiredDocuments}</p>}
          </div>
          
          {/* Critères d'éligibilité */}
          <div className={styles.inputGroup}>
            <label htmlFor="eligibilityCriteria" className={styles.label}>
              Critères d'éligibilité : <span style={{ color: "red" }}>*</span>
            </label>
            <textarea
              id="eligibilityCriteria"
              name="eligibilityCriteria"
              value={formData.eligibilityCriteria}
              onChange={handleChange}
              className={`${styles.textarea} ${validationErrors.eligibilityCriteria ? styles.inputError : ""}`}
              placeholder="Décrivez les critères d'éligibilité (format: nom: valeur)"
              rows="4"
            />
            <div className={styles.helpText}>
              Format: un critère par ligne sous la forme "nom: valeur" (ex: Nationalité: Marocaine)
            </div>
            {validationErrors.eligibilityCriteria && <p style={errorMessageStyle}>{validationErrors.eligibilityCriteria}</p>}
          </div>
          
          {/* PDF pour les détails */}
          <div className={styles.inputGroup}>
            <label htmlFor="pdfLink" className={styles.label}>
              Nom du fichier PDF des détails :
            </label>
            <input
              type="text"
              id="pdfLink"
              name="pdfLink"
              value={formData.pdfLink}
              onChange={handleChange}
              className={styles.input}
              placeholder="Nom du fichier PDF (ex: documents.pdf)"
            />
            <div className={styles.helpText}>
              Laissez le champ vide pour conserver le fichier existant
            </div>
          </div>
          
          <div className={styles.noteObligatoire}>
            <p><span style={{ color: "red" }}>*</span> Champs obligatoires</p>
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