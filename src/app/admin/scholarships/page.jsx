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

  useEffect(() => {
    // Appel de la fonction pour récupérer les bourses dynamiquement
    fetchScholarships();
  }, []);

  const fetchScholarships = async () => {
    setLoading(true);
    try {
      // Utilisation du proxy pour faire la requête
      const response = await fetch("/api/proxy/gestion-bourse-condidature-service/api/bourses");
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
    (scholarship.anneeAcademique && scholarship.anneeAcademique.toLowerCase().includes(searchTerm.toLowerCase())) ||
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
      // Utilisation du proxy pour faire la requête DELETE
      const response = await fetch(`/api/proxy/gestion-bourse-condidature-service/api/bourses/${scholarshipToDelete.id}`, {
        method: "DELETE",
      });
  
      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`);
      }
  
      // Suppression réussie, mettre à jour l'interface utilisateur
      setScholarships(scholarships.filter((s) => s.id !== scholarshipToDelete.id));
      setShowDeleteModal(false);
      setScholarshipToDelete(null);
      
      // Optionnel : afficher un message de succès
      // setSuccessMessage("Bourse supprimée avec succès");
      // setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      setError("Impossible de supprimer la bourse. Veuillez réessayer plus tard.");
      setShowDeleteModal(false);
    }
  };

  // Fonction pour afficher les critères d'éligibilité correctement
  const renderEligibilityCriteria = (criteria) => {
    if (Array.isArray(criteria)) {
      return criteria.map(criterion => `${criterion.name}: ${criterion.value}`).join(", ");
    }
    return criteria || "Non spécifié";
  };

  // Fonction pour afficher les documents requis correctement
  const renderRequiredDocuments = (documents) => {
    if (Array.isArray(documents)) {
      return documents.join(", ");
    }
    return documents || "Non spécifié";
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
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Critères d'éligibilité:</span>
                        <span className={styles.detailValue}>{renderEligibilityCriteria(scholarship.eligibilityCriteria)}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Documents requis:</span>
                        <span className={styles.detailValue}>{renderRequiredDocuments(scholarship.requiredDocuments)}</span>
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