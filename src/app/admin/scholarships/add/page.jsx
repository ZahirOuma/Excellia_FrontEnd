"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

const AddScholarshipPage = () => {
  const router = useRouter();
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
  const [error, setError] = useState(null);

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

      const response = await fetch("http://localhost:8080/api/scholarships", {
        method: "POST",
        body: formDataToSend,
        // Don't set Content-Type header when sending FormData
        // The browser will set it automatically with the correct boundary
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Erreur: ${response.status}`);
      }

      const result = await response.json();
      console.log("Bourse ajoutée avec succès:", result);
      alert("Bourse ajoutée avec succès!");
      router.push("/admin/scholarships");
    } catch (err) {
      console.error("Erreur lors de l'ajout de la bourse:", err);
      setError(err.message || "Une erreur est survenue lors de l'ajout de la bourse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Ajouter une nouvelle bourse</h1>
      
      <div className={styles.formContainer}>
        {error && <div className={styles.errorMessage}>{error}</div>}
        
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Nom de la bourse */}
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
          </div>
          
          {/* Boutons */}
          <div className={styles.buttonGroup}>
            <button
              type="submit"
              className={loading ? styles.submitButtonDisabled : styles.submitButton}
              disabled={loading}
            >
              {loading ? "Traitement en cours..." : "Enregistrer"}
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

export default AddScholarshipPage;