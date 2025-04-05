"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

const AddStudentPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    cne: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

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
    const requiredFields = ["nom", "prenom", "cne"];
    
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
    
    try {
      const response = await fetch("http://localhost:8080/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Erreur: ${response.status}`);
      }

      const result = await response.json();
      console.log("Étudiant ajouté avec succès:", result);
      alert("Étudiant ajouté avec succès!");
      router.push("/admin/students");
    } catch (err) {
      console.error("Erreur lors de l'ajout de l'étudiant:", err);
      setError(err.message || "Une erreur est survenue lors de l'ajout de l'étudiant");
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

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Ajouter un étudiant</h1>
      
      <div className={styles.formContainer}>
        {error && <div className={styles.errorMessage}>{error}</div>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="nom" className={styles.label}>
              Nom : <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              id="nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className={`${styles.input} ${validationErrors.nom ? styles.inputError : ""}`}
              placeholder="Entrez le nom de l'étudiant"
            />
            {validationErrors.nom && <p style={errorMessageStyle}>{validationErrors.nom}</p>}
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="prenom" className={styles.label}>
              Prénom : <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              id="prenom"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              className={`${styles.input} ${validationErrors.prenom ? styles.inputError : ""}`}
              placeholder="Entrez le prénom de l'étudiant"
            />
            {validationErrors.prenom && <p style={errorMessageStyle}>{validationErrors.prenom}</p>}
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="cne" className={styles.label}>
              CNE : <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              id="cne"
              name="cne"
              value={formData.cne}
              onChange={handleChange}
              className={`${styles.input} ${validationErrors.cne ? styles.inputError : ""}`}
              placeholder="Entrez le CNE de l'étudiant"
            />
            {validationErrors.cne && <p style={errorMessageStyle}>{validationErrors.cne}</p>}
          </div>
          
          <div className={styles.noteObligatoire}>
            <p><span style={{ color: "red" }}>*</span> Champs obligatoires</p>
          </div>
          
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
              onClick={() => router.push("/admin/students")}
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

export default AddStudentPage;