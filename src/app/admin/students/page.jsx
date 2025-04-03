"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import * as XLSX from 'xlsx';
import { FiSearch } from "react-icons/fi"; // Importez l'icône de recherche comme dans le code de scholarship

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // Ajout de l'état pour la recherche

  // Charger les étudiants depuis l'API
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/students");
      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`);
      }
      const data = await response.json();
      setStudents(data);
    } catch (err) {
      console.error("Erreur lors du chargement des étudiants:", err);
      // Utiliser des données simulées en cas d'erreur
      const mockStudents = [
        { id: 1, nom: "Benani", prenom: "Ahmed", cne: "G123456789" },
        { id: 2, nom: "Alami", prenom: "Fatima", cne: "G987654321" },
        { id: 3, nom: "Tazi", prenom: "Mohammed", cne: "G456789123" },
      ];
      setStudents(mockStudents);
    } finally {
      setLoading(false);
    }
  };

  // Confirmer la suppression avant de supprimer
  const confirmDelete = (id) => {
    const student = students.find(s => s.id === id);
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  // Supprimer un étudiant
  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/students/${studentToDelete.id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`);
      }
      
      setStudents(students.filter(student => student.id !== studentToDelete.id));
      setShowDeleteModal(false);
      setStudentToDelete(null);
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      setError("Erreur lors de la suppression de l'étudiant.");
    }
  };

  // Gérer le changement de fichier
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérification du type de fichier (Excel)
      if (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || 
          file.type === "application/vnd.ms-excel") {
        setImportFile(file);
        setError(null);
      } else {
        setError("Veuillez sélectionner un fichier Excel (.xlsx ou .xls)");
        fileInputRef.current.value = null;
      }
    }
  };

  // Fonction pour la lecture du fichier Excel
  const readExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Prendre la première feuille
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          
          // Convertir en JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          console.log("Données brutes du fichier Excel:", jsonData);
          
          if (jsonData.length === 0) {
            reject(new Error("Le fichier Excel est vide ou ne contient pas de données lisibles."));
            return;
          }
          
          // Vérifier si les colonnes existent exactement comme dans votre fichier
          const firstRow = jsonData[0];
          const expectedColumns = ["Nom", "Prénom", "CNE"];
          const hasExpectedColumns = expectedColumns.every(col => Object.keys(firstRow).includes(col));
          
          if (hasExpectedColumns) {
            // Si les colonnes existent exactement avec cette casse, on les utilise directement
            resolve(jsonData.map(row => ({
              nom: row["Nom"],
              prenom: row["Prénom"],
              cne: row["CNE"]
            })));
            return;
          }
          
          // Si les colonnes exactes ne sont pas trouvées, on cherche par correspondance insensible à la casse
          const normalizedData = jsonData.map(row => {
            const normalizedRow = {};
            
            // Recherche insensible à la casse des colonnes
            Object.keys(row).forEach(key => {
              const lowerKey = key.toLowerCase();
              if (lowerKey === 'nom') normalizedRow.nom = row[key];
              else if (lowerKey === 'prénom' || lowerKey === 'prenom') normalizedRow.prenom = row[key];
              else if (lowerKey === 'cne') normalizedRow.cne = row[key];
            });
            
            return normalizedRow;
          });
          
          // Vérifier que chaque ligne contient les données nécessaires
          const validData = normalizedData.filter(item => 
            item.nom && item.prenom && item.cne
          );
          
          if (validData.length === 0) {
            console.error("Données non valides:", normalizedData);
            reject(new Error("Le fichier ne contient pas de données valides ou les colonnes attendues (Nom, Prénom, CNE) sont manquantes. Vérifiez que vos en-têtes de colonnes correspondent exactement à 'Nom', 'Prénom' et 'CNE'."));
            return;
          }
          
          resolve(validData);
        } catch (error) {
          console.error("Erreur lors de la lecture du fichier Excel:", error);
          reject(new Error("Erreur lors de la lecture du fichier Excel. Veuillez vérifier le format du fichier."));
        }
      };
      
      reader.onerror = () => {
        reject(new Error("Erreur lors de la lecture du fichier."));
      };
      
      reader.readAsArrayBuffer(file);
    });
  };

  // Gérer l'importation du fichier
  const handleImport = async (e) => {
    // Au début de handleImport
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      console.log("Données du fichier Excel:", jsonData);
      alert("Vérifiez la console pour voir les données brutes");
    };
    reader.readAsArrayBuffer(importFile);
    
    e.preventDefault();
    if (!importFile) {
      setError("Veuillez sélectionner un fichier Excel");
      return;
    }

    setImporting(true);
    setError(null);

    try {
      // Lire le fichier Excel et convertir en JSON
      const excelData = await readExcelFile(importFile);
      
      // Envoyer les données à l'API
      const addedStudents = [];
      const failedStudents = [];
      
      // Traiter chaque étudiant séquentiellement
      for (const student of excelData) {
        try {
          const response = await fetch("http://localhost:8080/api/students", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(student),
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            failedStudents.push({
              ...student,
              error: errorData?.message || `Erreur: ${response.status}`
            });
            continue;
          }
          
          const addedStudent = await response.json();
          addedStudents.push(addedStudent);
        } catch (err) {
          failedStudents.push({
            ...student,
            error: err.message || "Erreur lors de l'ajout"
          });
        }
      }
      
      // Mettre à jour la liste des étudiants
      if (addedStudents.length > 0) {
        setStudents([...students, ...addedStudents]);
      }
      
      // Afficher un résumé
      if (failedStudents.length === 0) {
        alert(`Importation réussie! ${addedStudents.length} étudiants ajoutés.`);
      } else {
        alert(`Importation partiellement réussie! ${addedStudents.length} étudiants ajoutés, ${failedStudents.length} erreurs.`);
        console.log("Étudiants non importés:", failedStudents);
      }
      
      // Réinitialiser l'interface
      setShowImportModal(false);
      setImportFile(null);
      if (fileInputRef.current) fileInputRef.current.value = null;
      
    } catch (err) {
      setError(err.message || "Une erreur est survenue lors de l'importation");
    } finally {
      setImporting(false);
    }
  };

  // Gérer la recherche - nouvelle fonction
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filtrer les étudiants en fonction de la recherche - nouveau code
  const filteredStudents = students.filter((student) =>
    student.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.cne.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Gestion des Étudiants</h1>
      
      <div className={styles.actionsContainer}>
        {/* Barre de recherche - nouveau composant */}
        <div className={styles.searchBox}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Rechercher un étudiant..."
            value={searchTerm}
            onChange={handleSearch}
            className={styles.searchInput}
          />
        </div>
        
        <Link href="/admin/students/add">
          <button className={styles.actionButton}>
            <span>➕</span> Ajouter un étudiant
          </button>
        </Link>
        
        <button 
          className={styles.actionButton}
          onClick={() => setShowImportModal(true)}
        >
          <span>📂</span> Importer un fichier Excel
        </button>
      </div>

      {loading ? (
        <p className={styles.loading}>Chargement des données...</p>
      ) : (
        <div className={styles.tableContainer}>
          {filteredStudents.length > 0 ? ( // Modifié pour utiliser filteredStudents au lieu de students
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>CNE</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => ( // Modifié pour utiliser filteredStudents au lieu de students
                  <tr key={student.id}>
                    <td>{student.nom}</td>
                    <td>{student.prenom}</td>
                    <td>{student.cne}</td>
                    <td className={styles.actionButtonsCell}>
                      <Link href={`/admin/students/${student.id}/edit`}>
                        <button className={styles.editButton}>
                          <span>✏️</span> Modifier
                        </button>
                      </Link>
                      <button 
                        className={styles.deleteButton}
                        onClick={() => confirmDelete(student.id)}
                      >
                        <span>🗑️</span> Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className={styles.noStudents}>
              {searchTerm ? "Aucun étudiant trouvé pour cette recherche." : "Aucun étudiant trouvé. Ajoutez des étudiants pour les voir ici."}
            </p>
          )}
        </div>
      )}

      {/* Modal d'importation de fichier Excel */}
      {showImportModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>Importer des étudiants</h2>
            <form onSubmit={handleImport} className={styles.importForm}>
              <div className={styles.fileInputContainer}>
                <label htmlFor="excelFile" className={styles.fileLabel}>
                  Sélectionner un fichier Excel (.xlsx, .xls)
                </label>
                <input
                  type="file"
                  id="excelFile"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                  className={styles.fileInput}
                  ref={fileInputRef}
                  disabled={importing}
                />
                {importFile && (
                  <div className={styles.selectedFile}>
                    Fichier sélectionné: {importFile.name}
                  </div>
                )}
                {error && (
                  <div className={styles.errorMessage}>
                    {error}
                  </div>
                )}
              </div>
              
              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => {
                    setShowImportModal(false);
                    setError(null);
                    setImportFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = null;
                  }}
                  className={styles.cancelButton}
                  disabled={importing}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className={styles.importButton}
                  disabled={!importFile || importing}
                >
                  {importing ? "Importation en cours..." : "Importer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Confirmer la suppression</h3>
            <p className={styles.modalText}>
              Êtes-vous sûr de vouloir supprimer l'étudiant "{studentToDelete?.nom} {studentToDelete?.prenom}" ?
              Cette action est irréversible.
            </p>
            <div className={styles.modalButtons}>
              <button
                onClick={() => setShowDeleteModal(false)}
                className={styles.cancelButton}
              >
                Annuler
              </button>
              <button 
                onClick={handleDelete} 
                className={styles.confirmDeleteButton}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsPage;