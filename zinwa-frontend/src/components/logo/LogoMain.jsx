// material-ui
import { useTheme } from '@mui/material/styles';

/**
 * if you want to use image instead of <svg> uncomment following.
 *
 * import logoDark from 'assets/images/logo-dark.svg';
 * import logo from 'assets/images/logo.svg';
 *
 */
import zinwaLogo from 'assets/zinwaLogo.png';
import Box from '@mui/material/Box';

// ==============================|| LOGO SVG ||============================== //

export default function LogoMain() {
  const theme = useTheme();
  return (
    /**
     * if you want to use image instead of svg uncomment following, and comment out <svg> element.
     *
     * <img src={theme.palette.mode === ThemeMode.DARK ? logoDark : logo} alt="Mantis" width="100" />
     *
     */
    <>
<Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '12px 16px',
        width: '100%',
        backgroundColor: 'white',
        borderBottom: `1px solid ${theme.palette.divider}`
      }}
    >
      <img 
        src={zinwaLogo} 
        alt="ZINWA Logo" 
        style={{
          maxWidth: '80%',
          height: 'auto',
          maxHeight: '60px',
          objectFit: 'contain'
        }}
      />
    </Box>
    </>
  );
}
