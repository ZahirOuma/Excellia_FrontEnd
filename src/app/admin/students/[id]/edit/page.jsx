"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./page.module.css";

const EditStudentPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = searchParams.get("id"); // Récupérer l'ID de l'URL
  
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    cne: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  
  useEffect(() => {
    if (!studentId) return;
    
    // Charger les données de l'étudiant
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8080/api/students/${studentId}`);
        if (!response.ok) throw new Error("Échec du chargement des données");
        const student = await response.json();
        setFormData(student);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudent();
  }, [studentId]);
  
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
      const response = await fetch(`http://localhost:8080/api/students/${studentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Erreur: ${response.status}`);
      }
      
      alert("Étudiant modifié avec succès!");
      router.push("/admin/students");
    } catch (err) {
      setError(err.message || "Une erreur est survenue lors de la modification de l'étudiant");
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
      <h1 className={styles.title}>Modifier un étudiant</h1>
      
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
              {loading ? "Mise à jour en cours..." : "Modifier"}
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

export default EditStudentPage;