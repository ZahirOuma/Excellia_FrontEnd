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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Ajouter un étudiant</h1>
      
      <div className={styles.formContainer}>
        {error && <div className={styles.errorMessage}>{error}</div>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="nom" className={styles.label}>Nom :</label>
            <input
              type="text"
              id="nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="Entrez le nom de l'étudiant"
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="prenom" className={styles.label}>Prénom :</label>
            <input
              type="text"
              id="prenom"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="Entrez le prénom de l'étudiant"
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="cne" className={styles.label}>CNE :</label>
            <input
              type="text"
              id="cne"
              name="cne"
              value={formData.cne}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="Entrez le CNE de l'étudiant"
            />
          </div>
          
          <div className={styles.buttonGroup}>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? "Traitement en cours..." : "Enregistrer"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/students")}
              className={styles.cancelButton}
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