"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { FiEdit2, FiTrash2, FiSearch, FiPlus } from "react-icons/fi";

const ScholarshipsPage = () => {
  const router = useRouter();
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [scholarshipToDelete, setScholarshipToDelete] = useState(null);

  // Static scholarships updated with new English field names
  const staticScholarship = [{
    id: 1,
    title: "Bourse d'excellence TEST",
    university: "Université Mohammed V",
    description: "Bourse destinée aux étudiants excellents en informatique",
    anneeAcademique: "2023-2024",
    amount: 5000,
    duration: 10,
    places: 20,
    startDate: "2023-09-01",
    deadline: "2023-10-31",
    requiredDocuments: "CV, Relevé de notes, Lettre de motivation",
    eligibilityCriteria: "Moyenne générale supérieure à 16/20",
    pdfLink: null
  },{
    id: 2,
    title: "Bourse des ingenieurs",
    university: "École Nationale Supérieure d'Informatique",
    description: "Bourse réservée aux étudiants en génie informatique",
    anneeAcademique: "2023-2024",
    amount: 10000,
    duration: 30,
    places: 60,
    startDate: "2023-09-01",
    deadline: "2023-10-31",
    requiredDocuments: "CV, Diplômes, Certificats de stage",
    eligibilityCriteria: "Être inscrit en filière ingénieur",
    pdfLink: null
  },{
    id: 3,
    title: "Bourse des sciences",
    university: "Université Hassan II",
    description: "Bourse pour les étudiants en sciences fondamentales",
    anneeAcademique: "2023-2024",
    amount: 10000,
    duration: 30,
    places: 60,
    startDate: "2023-09-01",
    deadline: "2023-10-31",
    requiredDocuments: "CV, Relevé de notes, Projet de recherche",
    eligibilityCriteria: "Être inscrit en master ou doctorat",
    pdfLink: null
  },{
    id: 4,
    title: "Bourse internationale",
    university: "Université Euromed de Fès",
    description: "Bourse pour les étudiants internationaux",
    anneeAcademique: "2023-2024",
    amount: 10000,
    duration: 30,
    places: 60,
    startDate: "2023-09-01",
    deadline: "2023-10-31",
    requiredDocuments: "Passeport, CV, Relevé de notes, Lettre de recommandation",
    eligibilityCriteria: "Être étudiant étranger avec d'excellents résultats",
    pdfLink: null
  }];

  useEffect(() => {
    // Instead of calling the API, directly set the static scholarships
    setScholarships(staticScholarship);
    
    // To keep the dynamic version for later, simply uncomment:
    // fetchScholarships();
  }, []);

  const fetchScholarships = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/scholarships");
      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`);
      }
      const data = await response.json();
      setScholarships(data);
    } catch (err) {
      console.error("Erreur lors du chargement des bourses:", err);
      setError("Impossible de charger les bourses. Veuillez réessayer plus tard.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredScholarships = scholarships.filter((scholarship) =>
    scholarship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scholarship.anneeAcademique.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scholarship.university.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (id) => {
    router.push(`/admin/scholarships/${id}/edit`);
  };

  const confirmDelete = (scholarship) => {
    setScholarshipToDelete(scholarship);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      // For the static version, we only delete locally
      setScholarships(scholarships.filter((s) => s.id !== scholarshipToDelete.id));
      
      // For the dynamic version, uncomment this:
      /*
      const response = await fetch(`http://localhost:8080/api/scholarships/${scholarshipToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`);
      }

      setScholarships(scholarships.filter((s) => s.id !== scholarshipToDelete.id));
      */
      
      setShowDeleteModal(false);
      setScholarshipToDelete(null);
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      setError("Impossible de supprimer la bourse. Veuillez réessayer plus tard.");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Gestion des Bourses</h1>

      <div className={styles.formContainer}>
        <div className={styles.actionsBar}>
          <div className={styles.searchBox}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Rechercher une bourse..."
              value={searchTerm}
              onChange={handleSearch}
              className={styles.searchInput}
            />
          </div>
          <button
            onClick={() => router.push("/admin/scholarships/add")}
            className={styles.addButton}
          >
            <FiPlus className={styles.buttonIcon} /> Ajouter une bourse
          </button>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        {loading ? (
          <div className={styles.loadingMessage}>Chargement des bourses...</div>
        ) : (
          <div className={styles.scholarshipsGrid}>
            {filteredScholarships.length === 0 ? (
              <div className={styles.noResults}>
                Aucune bourse trouvée. {searchTerm && "Essayez une autre recherche."}
              </div>
            ) : (
              filteredScholarships.map((scholarship) => (
                <div key={scholarship.id} className={styles.scholarshipCard}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.scholarshipName}>{scholarship.title}</h2>
                    <span className={styles.academicYear}>{scholarship.anneeAcademique}</span>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.scholarshipDetails}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Université:</span>
                        <span className={styles.detailValue}>{scholarship.university}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Montant:</span>
                        <span className={styles.detailValue}>{scholarship.amount} MAD</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Durée:</span>
                        <span className={styles.detailValue}>{scholarship.duration} mois</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Places:</span>
                        <span className={styles.detailValue}>{scholarship.places}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Candidature:</span>
                        <span className={styles.detailValue}>
                          {new Date(scholarship.startDate).toLocaleDateString()} - {new Date(scholarship.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.cardActions}>
                    <button
                      onClick={() => handleEdit(scholarship.id)}
                      className={styles.editButton}
                      title="Modifier"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => confirmDelete(scholarship)}
                      className={styles.deleteButton}
                      title="Supprimer"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Confirmer la suppression</h3>
            <p className={styles.modalText}>
              Êtes-vous sûr de vouloir supprimer la bourse "{scholarshipToDelete?.title}" ?
              Cette action est irréversible.
            </p>
            <div className={styles.modalButtons}>
              <button
                onClick={() => setShowDeleteModal(false)}
                className={styles.cancelButton}
              >
                Annuler
              </button>
              <button onClick={handleDelete} className={styles.confirmDeleteButton}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScholarshipsPage;