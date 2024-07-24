import PropTypes from 'prop-types';
import { db } from "../appwrite/databases";
import { useContext } from "react";
import { NoteContext } from "../context/NoteContext";

const Color = ({ color }) => {
  const { selectedNote, notes, setNotes } = useContext(NoteContext);

  const changeColor = () => {
      console.log("Selected color:", selectedNote);

      try {
          const currentNoteIndex = notes.findIndex(
              (note) => note.$id === selectedNote.$id
          );

          const updatedNote = {
              ...notes[currentNoteIndex],
              colors: JSON.stringify(color),
          };

          const newNotes = [...notes];
          newNotes[currentNoteIndex] = updatedNote;
          setNotes(newNotes);

          db.notes.update(selectedNote.$id, {
              colors: JSON.stringify(color),
          });
      } catch (error) {
          alert("You must select a note before changing colors");
      }
  };

  return (
      <div
          onClick={changeColor}
          className="color"
          style={{ backgroundColor: color.colorHeader }}
      ></div>
  );
};

Color.propTypes = {
  color: PropTypes.shape({
    colorHeader: PropTypes.string.isRequired,
    colorBody: PropTypes.string,
    colorText: PropTypes.string,
  }).isRequired,
  notes: PropTypes.arrayOf(
    PropTypes.shape({
      $id: PropTypes.string.isRequired,
      position: PropTypes.string,
      colors: PropTypes.string,
      body: PropTypes.string,
    })
  ).isRequired,
  setNotes: PropTypes.func.isRequired,
};

export default Color;