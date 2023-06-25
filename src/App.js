import "./App.css";
import React, { useEffect, useState } from "react";
import axios from "axios";

const App = () => {
  const [name, setName] = useState("");
  const [selectedSectors, setSelectedSectors] = useState([]);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [id, setId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [sectorsList, setSectorList] = useState([]);
  const [editable, setEditable] = useState(false);
  const [registeredData, setRegisteredData] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3001/getSectors").then((res) => {
      let data = [];
      for (let i = 0; i < res?.data?.length; i++) {
        data.push(res?.data[i]?.sector);
      }
      console.log(res);
      setSectorList(data);
    });
    axios.get("http://localhost:3001/getUser").then((res) => {
      console.log(res);
      if (res.status === 200) {
        let data = res.data;
        data.map((item) => (item.sector = JSON.parse(item.sector)));
        setRegisteredData([...data]);
      }
    });
  }, []);

  const handleSectorSelect = (sector) => {
    if (selectedSectors.includes(sector)) {
      setSelectedSectors(selectedSectors.filter((s) => s !== sector));
    } else if (selectedSectors.length < 10) {
      setSelectedSectors([...selectedSectors, sector]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!name) {
      errors.name = "Name is required";
    }
    if (selectedSectors.length === 0) {
      errors.sectors = "At least one sector must be selected";
    }
    if (!agreeToTerms) {
      errors.terms = "Please agree to the terms";
    }
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      if (editable) {
        axios
          .put("http://localhost:3001/updateUser", {
            name: name,
            sector: JSON.stringify(selectedSectors),
            agree: agreeToTerms ? "yes" : "no",
            id: id,
          })
          .then((res) => {
            console.log(res);
            if (res.status === 200) {
              registeredData.map((item, i) => {
                if (item.id === id) {
                  item.name = name;
                  item.sector = selectedSectors;
                  item.agree = agreeToTerms ? "yes" : "no";
                }
              });
              setRegisteredData([...registeredData]);
            }
          });
        setEditable(false);
      } else {
        axios
          .post("http://localhost:3001/createUser", {
            name: name,
            sector: JSON.stringify(selectedSectors),
            agree: agreeToTerms ? "yes" : "no",
          })
          .then((res) => {
            console.log(res);
            if (res.status === 200) {
              setRegisteredData([
                ...registeredData,
                {
                  name: name,
                  sector: selectedSectors,
                  agree: agreeToTerms ? "yes" : "no",
                },
              ]);
            }
          });
      }
      setName("");
      setSelectedSectors([]);
      setAgreeToTerms(false);
      setId(null);
    }
  };

  const handleEdit = (data) => {
    setName(data?.name);
    setSelectedSectors(data?.sector);
    setAgreeToTerms(data.agree === "yes" ? true : false);
    setId(data?.id);
    setEditable(true);
    setFormErrors({});
  };

  const handleCancelEdit = () => {
    setName("");
    setSelectedSectors("");
    setAgreeToTerms(false);
    setEditable(false);
  };

  return (
    <div className="app">
      <div className="form-container">
        <h2>User Registration Form</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {formErrors.name && (
              <span className="error">{formErrors.name}</span>
            )}
          </div>
          <div className="form-field">
            <label htmlFor="sectors">Sectors:</label>
            <input
              type="text"
              id="sectors"
              placeholder="Type to search sectors"
            />
            <ul className="autocomplete-list">
              {sectorsList.map((sector, i) => (
                <li
                  key={i}
                  onClick={() => handleSectorSelect(sector)}
                  className={selectedSectors.includes(sector) ? "selected" : ""}
                >
                  {sector}
                </li>
              ))}
            </ul>
            {formErrors.sectors && (
              <span className="error">{formErrors.sectors}</span>
            )}
          </div>
          <div className="form-field">
            <div className="form-field-terms">
              <input
                type="checkbox"
                id="terms"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
              />
              <label htmlFor="terms">Agree to terms</label>
            </div>
            {formErrors.terms && (
              <span className="error">{formErrors.terms}</span>
            )}
          </div>
          <button type="submit">{editable ? "Update" : "Save"}</button>
          {editable && (
            <button className="cancel_button" onClick={handleCancelEdit}>
              Cancel
            </button>
          )}
        </form>
      </div>
      <div className="registered-info">
        <h2>User's Information</h2>
        {registeredData.length === 0 ? (
          <p>No entries found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Sectors</th>
                <th>Agreed to Terms</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {registeredData.map((entry, index) => (
                <tr key={index}>
                  <td>{entry.name}</td>
                  <td>{entry.sector.join(", ")}</td>
                  <td>{entry.agree}</td>
                  <td>
                    <button onClick={() => handleEdit(entry)}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default App;
