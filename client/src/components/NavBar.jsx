import { useContext } from "react";
import { Container, Nav, Navbar, Stack } from "react-bootstrap";
import { Link } from "react-router";
import { AuthContext } from "../context/AuthContext";

const NavBar = () => {
  const { user, logout } = useContext(AuthContext);

  const animatedTitleStyle = {
    fontFamily: "Fredoka One, sans-serif",
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#3498db",
    textTransform: "uppercase",
    textAlign: "center",
    animation: "fadeInUp 2s ease-in-out",
    letterSpacing: "3px",
    textShadow:
      "3px 3px 5px rgba(0, 0, 0, 0.3), 0px 0px 25px rgba(255, 255, 255, 0.5)",
  };

  return (
    <Navbar
      bg="primary"
      variant="dark"
      expand="lg"
      className="shadow-sm mb-4"
      style={{
        height: "4rem",
        borderBottom: "2px solid rgba(255,255,255,0.1)",
      }}
    >
      <Container fluid className="px-4">
        <Navbar.Brand
          as={Link}
          to="/"
          className="fw-bold text-white"
          style={animatedTitleStyle}
        >
          NGOBROL
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          {user && (
            <Nav.Item className="me-3 text-white-50 d-none d-md-block">
              Logged in as {user.name}
            </Nav.Item>
          )}

          <Nav>
            <Stack direction="horizontal" gap={3}>
              {!user && (
                <>
                  <Nav.Link as={Link} to="/login" className="text-white">
                    Login
                  </Nav.Link>
                  <Nav.Link as={Link} to="/register" className="text-white">
                    Register
                  </Nav.Link>
                </>
              )}

              {user && (
                <Nav.Link
                  as={Link}
                  to="/login"
                  onClick={() => logout()}
                  className="text-white"
                >
                  Logout
                </Nav.Link>
              )}
            </Stack>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
